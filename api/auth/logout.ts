import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearAuthCookie } from '../../lib/auth';
import { ok } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  clearAuthCookie(res);
  return ok(res, { message: 'Logged out' });
}
