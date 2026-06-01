import { Router } from 'express';
import { z } from 'zod';

const router = Router();
const providerSchema = z.object({ provider: z.enum(['tiktok', 'instagram', 'youtube']) });

router.get('/:provider', (req, res) => {
  const { provider } = providerSchema.parse(req.params);
  const authorizationUrl = `https://auth.example.com/${provider}/connect?redirect_uri=${encodeURIComponent(
    process.env.FRONTEND_URL ?? 'http://localhost:5173'
  )}`;

  res.json({ provider, authorizationUrl });
});

export default router;
