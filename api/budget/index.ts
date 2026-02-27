import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, budgetItems } from '../../db/client';
import { eq, desc } from 'drizzle-orm';
import { requireRole } from '../../lib/auth';
import { ok, err } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const FINANCE_ROLES = ['super_admin', 'finance_admin'];

  if (req.method === 'GET') {
    const user = await requireRole(req, res, FINANCE_ROLES);
    if (!user) return;

    const { period } = req.query;
    let query = db.select().from(budgetItems).orderBy(budgetItems.category).$dynamic();
    if (period) query = query.where(eq(budgetItems.period, period as string));
    const rows = await query;
    return ok(res, rows);
  }

  if (req.method === 'POST') {
    const user = await requireRole(req, res, FINANCE_ROLES);
    if (!user) return;

    const { category, allocated, spent, period } = req.body || {};
    if (!category || !allocated || !period) {
      return err(res, 'category, allocated, and period are required');
    }

    const [row] = await db.insert(budgetItems).values({
      category,
      allocated: String(allocated),
      spent: spent ? String(spent) : '0',
      period,
    }).returning();

    return ok(res, row, 201);
  }

  return err(res, 'Method not allowed', 405);
}
