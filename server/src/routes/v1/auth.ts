import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.get('/me', (_req, res) => {
  res.json({ user: null });
});

router.post('/sign-in', (req, res) => {
  const parsed = signInSchema.parse(req.body);
  const user = {
    name: parsed.email.split('@')[0],
    email: parsed.email,
  };

  res.json({ user });
});

export default router;
