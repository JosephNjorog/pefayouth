import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, payments, members, events } from '../../db/client';
import { eq, desc } from 'drizzle-orm';
import { requireRole, requireAuth } from '../../lib/auth';
import { ok, err } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const user = await requireRole(req, res, ['super_admin', 'finance_admin']);
    if (!user) return;

    const { eventId, status } = req.query;

    let query = db
      .select({
        id: payments.id,
        amount: payments.amount,
        status: payments.status,
        date: payments.date,
        transactionId: payments.transactionId,
        phoneNumber: payments.phoneNumber,
        memberId: payments.memberId,
        eventId: payments.eventId,
        memberName: members.name,
        eventTitle: events.title,
      })
      .from(payments)
      .leftJoin(members, eq(payments.memberId, members.id))
      .leftJoin(events, eq(payments.eventId, events.id))
      .orderBy(desc(payments.createdAt))
      .$dynamic();

    if (eventId) query = query.where(eq(payments.eventId, eventId as string));
    if (status) query = query.where(eq(payments.status, status as string));

    const rows = await query;
    return ok(res, rows);
  }

  if (req.method === 'POST') {
    const user = await requireAuth(req, res);
    if (!user) return;

    const { memberId, eventId, amount, phoneNumber } = req.body || {};
    if (!eventId || !amount) return err(res, 'eventId and amount are required');

    const today = new Date().toISOString().split('T')[0];
    const [row] = await db.insert(payments).values({
      memberId: memberId || user.memberId,
      eventId,
      amount: String(amount),
      status: 'pending',
      date: today,
      phoneNumber,
    }).returning();

    return ok(res, row, 201);
  }

  return err(res, 'Method not allowed', 405);
}
