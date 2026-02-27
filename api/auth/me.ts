import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../../lib/auth';
import { ok } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  const user = await requireAuth(req, res);
  if (!user) return;
  return ok(res, { id: user.id, email: user.email, role: user.role, name: user.name, memberId: user.memberId });
}
