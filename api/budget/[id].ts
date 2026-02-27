import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, budgetItems } from '../../db/client';
import { eq } from 'drizzle-orm';
import { requireRole } from '../../lib/auth';
import { ok, err } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id || typeof id !== 'string') return err(res, 'Budget item ID required');

  const FINANCE_ROLES = ['super_admin', 'finance_admin'];

  if (req.method === 'PUT') {
    const user = await requireRole(req, res, FINANCE_ROLES);
    if (!user) return;

    const { category, allocated, spent, period } = req.body || {};
    const [updated] = await db
      .update(budgetItems)
      .set({
        category,
        allocated: allocated ? String(allocated) : undefined,
        spent: spent !== undefined ? String(spent) : undefined,
        period,
        updatedAt: new Date(),
      })
      .where(eq(budgetItems.id, id))
      .returning();

    if (!updated) return err(res, 'Budget item not found', 404);
    return ok(res, updated);
  }

  if (req.method === 'DELETE') {
    const user = await requireRole(req, res, FINANCE_ROLES);
    if (!user) return;

    await db.delete(budgetItems).where(eq(budgetItems.id, id));
    return ok(res, { message: 'Budget item deleted' });
  }

  return err(res, 'Method not allowed', 405);
}
