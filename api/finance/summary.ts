import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, offerings, expenses, payments } from '../../db/client';
import { eq, gte, lte, and, sum } from 'drizzle-orm';
import { requireRole } from '../../lib/auth';
import { ok } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const user = await requireRole(req, res, ['super_admin', 'finance_admin']);
  if (!user) return;

  // Build last 6 months summary
  const now = new Date();
  const months = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    const endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    // Offerings income
    const [{ totalOfferings }] = await db
      .select({ totalOfferings: sum(offerings.amount) })
      .from(offerings)
      .where(and(gte(offerings.date, startDate), lte(offerings.date, endDateStr)));

    // Confirmed payments income
    const [{ totalPayments }] = await db
      .select({ totalPayments: sum(payments.amount) })
      .from(payments)
      .where(and(
        eq(payments.status, 'confirmed'),
        gte(payments.date, startDate),
        lte(payments.date, endDateStr)
      ));

    // Approved expenses
    const [{ totalExpenses }] = await db
      .select({ totalExpenses: sum(expenses.amount) })
      .from(expenses)
      .where(and(
        eq(expenses.status, 'approved'),
        gte(expenses.date, startDate),
        lte(expenses.date, endDateStr)
      ));

    const income = (Number(totalOfferings) || 0) + (Number(totalPayments) || 0);
    const exp = Number(totalExpenses) || 0;
    months.push({ month: monthLabel, income, expenses: exp, balance: income - exp });
  }

  return ok(res, months);
}
