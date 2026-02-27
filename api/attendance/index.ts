import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, attendance, members, events } from '../../db/client';
import { eq, desc, and } from 'drizzle-orm';
import { requireRole, requireAuth } from '../../lib/auth';
import { ok, err } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const user = await requireAuth(req, res);
    if (!user) return;

    const { eventId, memberId } = req.query;

    if (user.role === 'member') {
      // Members can only see their own attendance
      const rows = await db
        .select({
          id: attendance.id,
          present: attendance.present,
          date: attendance.date,
          eventTitle: events.title,
          eventType: events.type,
        })
        .from(attendance)
        .leftJoin(events, eq(attendance.eventId, events.id))
        .where(eq(attendance.memberId, user.memberId!))
        .orderBy(desc(attendance.date))
        .limit(50);
      return ok(res, rows);
    }

    // Admins can query by event or member
    if (eventId) {
      const rows = await db
        .select({
          id: attendance.id,
          present: attendance.present,
          date: attendance.date,
          memberId: attendance.memberId,
          memberName: members.name,
        })
        .from(attendance)
        .leftJoin(members, eq(attendance.memberId, members.id))
        .where(eq(attendance.eventId, eventId as string))
        .orderBy(members.name);
      return ok(res, rows);
    }

    // Summary by event (for admin dashboard)
    const rows = await db
      .select({
        id: attendance.id,
        eventId: attendance.eventId,
        eventTitle: events.title,
        date: attendance.date,
        present: attendance.present,
      })
      .from(attendance)
      .leftJoin(events, eq(attendance.eventId, events.id))
      .orderBy(desc(attendance.date))
      .limit(100);
    return ok(res, rows);
  }

  if (req.method === 'POST') {
    // Admin records attendance — body: { eventId, records: [{memberId, present}] }
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;

    const { eventId, records } = req.body || {};
    if (!eventId || !Array.isArray(records)) {
      return err(res, 'eventId and records[] are required');
    }

    const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event) return err(res, 'Event not found', 404);

    // Upsert attendance records
    const values = records.map((r: { memberId: string; present: boolean }) => ({
      eventId,
      memberId: r.memberId,
      present: r.present ?? true,
      date: event.date,
    }));

    await db.insert(attendance).values(values).onConflictDoUpdate({
      target: [attendance.eventId, attendance.memberId],
      set: { present: attendance.present },
    });

    // Update member attendance rates
    for (const r of records) {
      const allRecords = await db.select().from(attendance).where(eq(attendance.memberId, r.memberId));
      if (allRecords.length > 0) {
        const presentCount = allRecords.filter((a) => a.present).length;
        const rate = ((presentCount / allRecords.length) * 100).toFixed(2);
        await db.update(members).set({ attendanceRate: rate }).where(eq(members.id, r.memberId));
      }
    }

    return ok(res, { message: 'Attendance recorded', count: values.length });
  }

  return err(res, 'Method not allowed', 405);
}
