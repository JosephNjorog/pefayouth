import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, payments } from '../../db/client';
import { eq } from 'drizzle-orm';
import { requireRole, requireAuth } from '../../lib/auth';
import { ok, err } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id || typeof id !== 'string') return err(res, 'Payment ID required');

  if (req.method === 'GET') {
    const user = await requireAuth(req, res);
    if (!user) return;

    const [row] = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    if (!row) return err(res, 'Payment not found', 404);

    // Members can only see their own payments
    if (user.role === 'member' && row.memberId !== user.memberId) {
      return err(res, 'Forbidden', 403);
    }

    return ok(res, row);
  }

  if (req.method === 'PUT') {
    const user = await requireRole(req, res, ['super_admin', 'finance_admin']);
    if (!user) return;

    const { status, transactionId } = req.body || {};
    const [updated] = await db
      .update(payments)
      .set({ status, transactionId, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();

    if (!updated) return err(res, 'Payment not found', 404);
    return ok(res, updated);
  }

  return err(res, 'Method not allowed', 405);
}
