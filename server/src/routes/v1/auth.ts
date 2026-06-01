import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { AuthRequest, requireAuth } from '../../middleware/auth';

const router = Router();

const authSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const registerSchema = authSchema.extend({
  name: z.string().trim().min(2, 'Name is required.'),
});

const publicUser = (user: { id: string; email: string; name: string; createdAt?: Date }) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  createdAt: user.createdAt,
});

const signToken = (userId: string) => jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({ where: { email: parsed.email } });

    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const password = await bcrypt.hash(parsed.password, 12);
    const user = await prisma.user.create({ data: { email: parsed.email, name: parsed.name, password } });

    return res.status(201).json({ token: signToken(user.id), user: publicUser(user) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues[0]?.message ?? 'Invalid registration details.' });
    }

    console.error(error);
    return res.status(500).json({ message: 'Unable to create account right now.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const parsed = authSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: parsed.email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(parsed.password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.json({ token: signToken(user.id), user: publicUser(user) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues[0]?.message ?? 'Invalid login details.' });
    }

    console.error(error);
    return res.status(500).json({ message: 'Unable to sign in right now.' });
  }
});

router.post('/sign-in', async (req, res) => {
  try {
    const parsed = authSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: parsed.email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(parsed.password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.json({ token: signToken(user.id), user: publicUser(user) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues[0]?.message ?? 'Invalid login details.' });
    }

    console.error(error);
    return res.status(500).json({ message: 'Unable to sign in right now.' });
  }
});

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to load the current user.' });
  }
});

export default router;
