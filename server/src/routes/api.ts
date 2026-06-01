import { Router } from 'express';
import { healthController } from '../controllers/health';

const router = Router();

router.get('/health', healthController);

router.get('/analytics', (req, res) => {
  res.json({
    message: 'Analytics endpoint placeholder',
    platform: req.query.platform ?? 'all',
    demo: {
      tiktok: 'Combined reach, engagement, and viral score',
      youtube: 'Watch hours, retention, and subscriber velocity',
      instagram: 'Reels reach, saves, and audience resonance',
    },
  });
});

router.get('/auth', (req, res) => {
  res.json({ message: 'Authentication endpoint placeholder', authenticated: false });
});

router.get('/subscriptions', (req, res) => {
  res.json({
    currentPlan: 'Starter',
    status: 'trial',
    price: '$19/mo',
    trialDaysRemaining: 30,
    nextBillingDate: '2026-07-01',
  });
});

router.post('/payments', (req, res) => {
  res.json({ message: 'Stripe payment endpoint placeholder', success: true, redirectTo: '/checkout' });
});

router.get('/agency', (req, res) => {
  res.json({
    packages: [
      { name: 'Growth Accelerator', details: 'Cross-platform creator strategy and sponsor activation' },
      { name: 'Revenue Booster', details: 'Brand deal, booking, and payout forecasting support' },
    ],
  });
});

export default router;
