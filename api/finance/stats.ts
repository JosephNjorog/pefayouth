import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, members, events, payments, attendance, newsletters, budgetItems } from '../../db/client';
import { eq, gte, count, sum } from 'drizzle-orm';
import { requireRole } from '../../lib/auth';
import { ok } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const user = await requireRole(req, res, ['super_admin', 'finance_admin', 'secretary']);
  if (!user) return;

  const today = new Date().toISOString().split('T')[0];

  // Total members
  const [{ memberCount }] = await db.select({ memberCount: count() }).from(members);

  // Upcoming events
  const [{ eventCount }] = await db.select({ eventCount: count() }).from(events).where(gte(events.date, today));

  // Confirmed payments total
  const [{ revenue }] = await db.select({ revenue: sum(payments.amount) }).from(payments).where(eq(payments.status, 'confirmed'));

  // Attendance rate (average)
  const allMembers = await db.select({ attendanceRate: members.attendanceRate }).from(members);
  const avgAttendance = allMembers.length
    ? allMembers.reduce((acc, m) => acc + (Number(m.attendanceRate) || 0), 0) / allMembers.length
    : 0;

  // Newsletter count
  const [{ nlCount }] = await db.select({ nlCount: count() }).from(newsletters).where(eq(newsletters.status, 'published'));

  // Budget utilization
  const budgets = await db.select().from(budgetItems);
  const totalAllocated = budgets.reduce((a, b) => a + (Number(b.allocated) || 0), 0);
  const totalSpent = budgets.reduce((a, b) => a + (Number(b.spent) || 0), 0);
  const budgetUtilization = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  return ok(res, {
    memberCount: Number(memberCount),
    upcomingEvents: Number(eventCount),
    totalRevenue: Number(revenue) || 0,
    avgAttendanceRate: Math.round(avgAttendance),
    publishedNewsletters: Number(nlCount),
    budgetUtilization,
    totalAllocated,
    totalSpent,
  });
}
