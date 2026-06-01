import { Router } from 'express';
import analyticsRouter from './analytics';
import authRouter from './auth';
import connectRouter from './connect';
import aiRouter from './ai';
import billingRouter from './billing';
import youtubeRouter from '../youtube';

const router = Router();

router.use('/auth', authRouter);
router.use('/connect', connectRouter);
router.use('/analytics', analyticsRouter);
router.use('/ai', aiRouter);
router.use('/billing', billingRouter);
router.use('/youtube', youtubeRouter);

router.get('/', (_req, res) => {
  res.json({ message: 'CreatorScope API v1 is active' });
});

export default router;
