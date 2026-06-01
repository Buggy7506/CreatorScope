import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const checkoutSchema = z.object({
  priceId: z.string().min(1),
});

router.get('/plan', (_req, res) => {
  res.json({
    currentPlan: 'Starter',
    status: 'trial',
    price: '$19/mo',
    trialDaysRemaining: 30,
    nextBillingDate: '2026-07-01',
  });
});

router.post('/checkout', (req, res) => {
  const { priceId } = checkoutSchema.parse(req.body);
  res.json({
    success: true,
    priceId,
    checkoutUrl: `https://checkout.stripe.com/pay/${priceId}`,
  });
});

export default router;
