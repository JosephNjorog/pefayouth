import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, users, members } from '../../db/client';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signJWT, setAuthCookie } from '../../lib/auth';
import { ok, err } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);

  const { email, password } = req.body || {};
  if (!email || !password) return err(res, 'Email and password are required');

  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (!user) return err(res, 'Invalid email or password', 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return err(res, 'Invalid email or password', 401);

  // Get member name
  let name = user.email;
  if (user.memberId) {
    const [member] = await db.select().from(members).where(eq(members.id, user.memberId)).limit(1);
    if (member) name = member.name;
  }

  const token = await signJWT({
    id: user.id,
    email: user.email,
    role: user.role,
    name,
    memberId: user.memberId || undefined,
  });

  setAuthCookie(res, token);
  return ok(res, { id: user.id, email: user.email, role: user.role, name, memberId: user.memberId });
}
