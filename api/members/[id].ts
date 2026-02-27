import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, members, attendance, events } from '../../db/client';
import { eq, desc } from 'drizzle-orm';
import { requireRole, requireAuth } from '../../lib/auth';
import { ok, err } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id || typeof id !== 'string') return err(res, 'Member ID required');

  if (req.method === 'GET') {
    const user = await requireAuth(req, res);
    if (!user) return;

    // Members can only view their own profile; admins can view all
    if (user.role === 'member' && user.memberId !== id) {
      return err(res, 'Forbidden', 403);
    }

    const [member] = await db.select().from(members).where(eq(members.id, id)).limit(1);
    if (!member) return err(res, 'Member not found', 404);

    // Fetch attendance history
    const history = await db
      .select({
        id: attendance.id,
        present: attendance.present,
        date: attendance.date,
        eventTitle: events.title,
        eventType: events.type,
      })
      .from(attendance)
      .leftJoin(events, eq(attendance.eventId, events.id))
      .where(eq(attendance.memberId, id))
      .orderBy(desc(attendance.date))
      .limit(50);

    return ok(res, { ...member, attendanceHistory: history });
  }

  if (req.method === 'PUT') {
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;

    const { name, phone, email, ministry, cellGroup, joinedDate, attendanceRate } = req.body || {};
    const [updated] = await db
      .update(members)
      .set({ name, phone, email, ministry, cellGroup, joinedDate, attendanceRate, updatedAt: new Date() })
      .where(eq(members.id, id))
      .returning();

    if (!updated) return err(res, 'Member not found', 404);
    return ok(res, updated);
  }

  if (req.method === 'DELETE') {
    const user = await requireRole(req, res, ['super_admin']);
    if (!user) return;

    await db.delete(members).where(eq(members.id, id));
    return ok(res, { message: 'Member deleted' });
  }

  return err(res, 'Method not allowed', 405);
}
