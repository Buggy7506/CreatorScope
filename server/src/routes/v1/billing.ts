import crypto from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../config/db';
import { createId } from '../../lib/ids';
import type { SubscriptionStatus, UserRow } from '../../types/database';
import { AuthRequest, requireAuth } from '../../middleware/auth';
import { env } from '../../config/env';

const router = Router();

const checkoutSchema = z.object({
  tier: z.enum(['PRO', 'ENTERPRISE']).default('PRO'),
  priceId: z.string().min(1).optional(),
});

const portalSchema = z.object({
  customerId: z.string().min(1).optional(),
});

type StripeSubscriptionPayload = {
  id: string;
  customer?: string;
  status?: string;
  cancel_at_period_end?: boolean;
  current_period_start?: number;
  current_period_end?: number;
  canceled_at?: number | null;
  trial_end?: number | null;
  items?: { data?: Array<{ price?: { id?: string; product?: string } }> };
  metadata?: Record<string, string>;
};

const toStripeTimestamp = (timestamp?: number | null) => (timestamp ? new Date(timestamp * 1000) : null);

const toSubscriptionStatus = (status?: string): SubscriptionStatus => {
  switch (status) {
    case 'trialing':
      return 'TRIALING';
    case 'active':
      return 'ACTIVE';
    case 'past_due':
      return 'PAST_DUE';
    case 'canceled':
      return 'CANCELED';
    case 'incomplete':
      return 'INCOMPLETE';
    case 'incomplete_expired':
      return 'INCOMPLETE_EXPIRED';
    case 'unpaid':
      return 'UNPAID';
    default:
      return 'ACTIVE';
  }
};

const priceForTier = (tier: 'PRO' | 'ENTERPRISE', explicitPriceId?: string) => {
  if (explicitPriceId) return explicitPriceId;
  if (tier === 'ENTERPRISE') return env.STRIPE_ENTERPRISE_PRICE_ID;
  return env.STRIPE_PRO_PRICE_ID;
};

async function stripeRequest<T>(path: string, body: URLSearchParams): Promise<T> {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key is not configured.');
  }

  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? 'Stripe API request failed.');
  }

  return payload as T;
}

function verifyStripeSignature(rawBody: Buffer, signatureHeader?: string) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Stripe webhook secret is not configured.');
  }

  if (!signatureHeader) {
    throw new Error('Stripe signature header is missing.');
  }

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => {
      const [key, value] = part.split('=');
      return [key, value];
    }),
  );

  const timestamp = parts.t;
  const expectedSignature = parts.v1;

  if (!timestamp || !expectedSignature) {
    throw new Error('Stripe signature header is malformed.');
  }

  const signedPayload = `${timestamp}.${rawBody.toString('utf8')}`;
  const computedSignature = crypto
    .createHmac('sha256', env.STRIPE_WEBHOOK_SECRET)
    .update(signedPayload)
    .digest('hex');

  const expected = Buffer.from(expectedSignature, 'hex');
  const actual = Buffer.from(computedSignature, 'hex');

  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    throw new Error('Stripe webhook signature verification failed.');
  }
}

async function upsertSubscription(subscription: StripeSubscriptionPayload, fallbackUserId?: string) {
  const price = subscription.items?.data?.[0]?.price;
  const userId = subscription.metadata?.userId ?? fallbackUserId;

  if (!userId) return;

  await query(
    `INSERT INTO "Subscription" (
      "id", "userId", "tier", "status", "stripeCustomerId", "stripeSubscriptionId", "stripePriceId", "stripeProductId",
      "currentPeriodStart", "currentPeriodEnd", "cancelAtPeriodEnd", "canceledAt", "trialEndsAt", "updatedAt"
     ) VALUES ($1, $2, $3::"SubscriptionTier", $4::"SubscriptionStatus", $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
     ON CONFLICT ("stripeSubscriptionId") DO UPDATE SET
      "status" = EXCLUDED."status",
      "stripeCustomerId" = EXCLUDED."stripeCustomerId",
      "stripePriceId" = EXCLUDED."stripePriceId",
      "stripeProductId" = EXCLUDED."stripeProductId",
      "currentPeriodStart" = EXCLUDED."currentPeriodStart",
      "currentPeriodEnd" = EXCLUDED."currentPeriodEnd",
      "cancelAtPeriodEnd" = EXCLUDED."cancelAtPeriodEnd",
      "canceledAt" = EXCLUDED."canceledAt",
      "trialEndsAt" = EXCLUDED."trialEndsAt",
      "updatedAt" = NOW()`,
    [
      createId(),
      userId,
      subscription.metadata?.tier === 'ENTERPRISE' ? 'ENTERPRISE' : 'PRO',
      toSubscriptionStatus(subscription.status),
      subscription.customer ?? null,
      subscription.id,
      price?.id ?? null,
      price?.product ?? null,
      toStripeTimestamp(subscription.current_period_start),
      toStripeTimestamp(subscription.current_period_end),
      Boolean(subscription.cancel_at_period_end),
      toStripeTimestamp(subscription.canceled_at),
      toStripeTimestamp(subscription.trial_end),
    ],
  );
}

router.get('/plan', requireAuth, async (req: AuthRequest, res) => {
  const subscription = (await query(
    'SELECT * FROM "Subscription" WHERE "userId" = $1 ORDER BY "updatedAt" DESC LIMIT 1',
    [req.userId],
  )).rows[0];

  res.json({
    currentPlan: subscription?.tier ?? 'FREE',
    status: subscription?.status ?? 'ACTIVE',
    stripeCustomerId: subscription?.stripeCustomerId,
    nextBillingDate: subscription?.currentPeriodEnd,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
  });
});

router.post('/checkout', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { tier, priceId: explicitPriceId } = checkoutSchema.parse(req.body);
    const priceId = priceForTier(tier, explicitPriceId);

    if (!priceId) {
      return res.status(400).json({ message: `Stripe price ID for ${tier} is not configured.` });
    }

    const user = (await query<UserRow>('SELECT * FROM "User" WHERE "id" = $1 LIMIT 1', [req.userId])).rows[0];
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const params = new URLSearchParams();
    params.set('mode', 'subscription');
    params.set('success_url', `${env.FRONTEND_URL}/settings?billing=success`);
    params.set('cancel_url', `${env.FRONTEND_URL}/settings?billing=cancelled`);
    params.set('customer_email', user.email);
    params.set('line_items[0][price]', priceId);
    params.set('line_items[0][quantity]', '1');
    params.set('subscription_data[metadata][userId]', user.id);
    params.set('subscription_data[metadata][tier]', tier);
    params.set('metadata[userId]', user.id);
    params.set('metadata[tier]', tier);

    const session = await stripeRequest<{ id: string; url: string }>('/checkout/sessions', params);

    return res.json({ success: true, checkoutSessionId: session.id, checkoutUrl: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues[0]?.message ?? 'Invalid checkout payload.' });
    }
    console.error(error);
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Unable to create checkout session.' });
  }
});

router.post('/portal', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { customerId } = portalSchema.parse(req.body);
    const subscription = (await query<{ stripeCustomerId: string | null }>(
      'SELECT * FROM "Subscription" WHERE "userId" = $1 ORDER BY "updatedAt" DESC LIMIT 1',
      [req.userId],
    )).rows[0];
    const stripeCustomerId = customerId ?? subscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      return res.status(400).json({ message: 'No Stripe customer is attached to this account yet.' });
    }

    const params = new URLSearchParams();
    params.set('customer', stripeCustomerId);
    params.set('return_url', `${env.FRONTEND_URL}/settings`);

    const session = await stripeRequest<{ id: string; url: string }>('/billing_portal/sessions', params);
    return res.json({ success: true, portalSessionId: session.id, portalUrl: session.url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Unable to open billing portal.' });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    verifyStripeSignature(rawBody, req.headers['stripe-signature']?.toString());

    const event = JSON.parse(rawBody.toString('utf8')) as { type: string; data: { object: any } };

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as { subscription?: string; customer?: string; metadata?: Record<string, string> };
        if (session.subscription && session.metadata?.userId) {
          await query(
            `INSERT INTO "Subscription" ("id", "userId", "tier", "status", "stripeCustomerId", "stripeSubscriptionId", "updatedAt")
             VALUES ($1, $2, $3::"SubscriptionTier", 'ACTIVE'::"SubscriptionStatus", $4, $5, NOW())
             ON CONFLICT ("stripeSubscriptionId") DO UPDATE SET
              "stripeCustomerId" = EXCLUDED."stripeCustomerId",
              "tier" = EXCLUDED."tier",
              "updatedAt" = NOW()`,
            [
              createId(),
              session.metadata.userId,
              session.metadata.tier === 'ENTERPRISE' ? 'ENTERPRISE' : 'PRO',
              session.customer ?? null,
              session.subscription,
            ],
          );
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await upsertSubscription(event.data.object as StripeSubscriptionPayload);
        break;
      case 'invoice.payment_failed':
        if (event.data.object.subscription) {
          await query(
            'UPDATE "Subscription" SET "status" = $1::"SubscriptionStatus", "updatedAt" = NOW() WHERE "stripeSubscriptionId" = $2',
            ['PAST_DUE', event.data.object.subscription],
          );
        }
        break;
      case 'invoice.payment_succeeded':
        if (event.data.object.subscription) {
          await query(
            'UPDATE "Subscription" SET "status" = $1::"SubscriptionStatus", "updatedAt" = NOW() WHERE "stripeSubscriptionId" = $2',
            ['ACTIVE', event.data.object.subscription],
          );
        }
        break;
      default:
        break;
    }

    return res.json({ received: true });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid Stripe webhook.' });
  }
});

export default router;
