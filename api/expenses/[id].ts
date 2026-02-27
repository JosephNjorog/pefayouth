import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, expenses } from '../../db/client';
import { eq } from 'drizzle-orm';
import { requireRole } from '../../lib/auth';
import { ok, err } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id || typeof id !== 'string') return err(res, 'Expense ID required');

  const FINANCE_ROLES = ['super_admin', 'finance_admin'];

  if (req.method === 'PUT') {
    const user = await requireRole(req, res, FINANCE_ROLES);
    if (!user) return;

    const { category, description, amount, date, approvedBy, status, receiptNo } = req.body || {};
    const [updated] = await db
      .update(expenses)
      .set({ category, description, amount: amount ? String(amount) : undefined, date, approvedBy, status, receiptNo, updatedAt: new Date() })
      .where(eq(expenses.id, id))
      .returning();

    if (!updated) return err(res, 'Expense not found', 404);
    return ok(res, updated);
  }

  if (req.method === 'DELETE') {
    const user = await requireRole(req, res, FINANCE_ROLES);
    if (!user) return;

    await db.delete(expenses).where(eq(expenses.id, id));
    return ok(res, { message: 'Expense deleted' });
  }

  return err(res, 'Method not allowed', 405);
}
