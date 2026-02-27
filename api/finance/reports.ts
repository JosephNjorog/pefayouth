import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, offerings, expenses, payments, members } from '../../db/client';
import { eq, sum, count, desc } from 'drizzle-orm';
import { requireRole } from '../../lib/auth';
import { ok } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const user = await requireRole(req, res, ['super_admin', 'finance_admin']);
  if (!user) return;

  // Offerings by type
  const offeringsByType = await db
    .select({ type: offerings.type, total: sum(offerings.amount) })
    .from(offerings)
    .groupBy(offerings.type);

  // Expenses by category
  const expensesByCategory = await db
    .select({ category: expenses.category, total: sum(expenses.amount), status: expenses.status })
    .from(expenses)
    .groupBy(expenses.category, expenses.status);

  // Payment stats
  const [{ totalConfirmed }] = await db
    .select({ totalConfirmed: sum(payments.amount) })
    .from(payments)
    .where(eq(payments.status, 'confirmed'));

  const [{ totalPending }] = await db
    .select({ totalPending: sum(payments.amount) })
    .from(payments)
    .where(eq(payments.status, 'pending'));

  const [{ memberCount }] = await db.select({ memberCount: count() }).from(members);

  return ok(res, {
    offeringsByType: offeringsByType.map((r) => ({ type: r.type, total: Number(r.total) || 0 })),
    expensesByCategory: expensesByCategory.map((r) => ({ category: r.category, total: Number(r.total) || 0, status: r.status })),
    paymentStats: {
      confirmedTotal: Number(totalConfirmed) || 0,
      pendingTotal: Number(totalPending) || 0,
    },
    memberCount: Number(memberCount) || 0,
  });
}
