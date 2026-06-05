import { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../../config/env';
import { query } from '../../config/db';
import { createId } from '../../lib/ids';
import { AuthRequest, requireAuth } from '../../middleware/auth';
import type { UserRow } from '../../types/database';

const router = Router();

const authSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const registerSchema = authSchema.extend({
  name: z.string().trim().min(2, 'Name is required.'),
});

const publicUser = (user: Pick<UserRow, 'id' | 'email' | 'name' | 'createdAt'>) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  createdAt: user.createdAt,
});

const signToken = (userId: string) => jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '7d' });

const findUserByEmail = async (email: string) => {
  const result = await query<UserRow>('SELECT * FROM "User" WHERE "email" = $1 LIMIT 1', [email]);
  return result.rows[0] ?? null;
};

router.post('/register', async (req, res) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const existingUser = await findUserByEmail(parsed.email);

    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const password = await bcrypt.hash(parsed.password, 12);
    const user = await query<UserRow>(
      `INSERT INTO "User" ("id", "email", "name", "password", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [createId(), parsed.email, parsed.name, password],
    );

    return res.status(201).json({ token: signToken(user.rows[0].id), user: publicUser(user.rows[0]) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues[0]?.message ?? 'Invalid registration details.' });
    }

    console.error(error);
    return res.status(500).json({ message: 'Unable to create account right now.' });
  }
});

const loginHandler = async (req: Request, res: Response) => {
  try {
    const parsed = authSchema.parse(req.body);
    const user = await findUserByEmail(parsed.email);

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
};

router.post('/login', loginHandler);
router.post('/sign-in', loginHandler);

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const result = await query<Pick<UserRow, 'id' | 'email' | 'name' | 'createdAt'>>(
      'SELECT "id", "email", "name", "createdAt" FROM "User" WHERE "id" = $1 LIMIT 1',
      [req.userId],
    );
    const user = result.rows[0];

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
