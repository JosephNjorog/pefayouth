import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, events, attendance, members } from '../../db/client';
import { eq, count } from 'drizzle-orm';
import { requireRole } from '../../lib/auth';
import { ok, err } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id || typeof id !== 'string') return err(res, 'Event ID required');

  if (req.method === 'GET') {
    const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
    if (!event) return err(res, 'Event not found', 404);

    // Get attendance summary for this event
    const [{ count: presentCount }] = await db
      .select({ count: count() })
      .from(attendance)
      .where(eq(attendance.eventId, id));

    return ok(res, { ...event, presentCount: Number(presentCount) });
  }

  if (req.method === 'PUT') {
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;

    const { title, description, date, time, location, type, isPaid, price, capacity, registered } = req.body || {};
    const [updated] = await db
      .update(events)
      .set({
        title, description, date, time, location, type,
        isPaid, price: price ? String(price) : undefined,
        capacity, registered,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    if (!updated) return err(res, 'Event not found', 404);
    return ok(res, updated);
  }

  if (req.method === 'DELETE') {
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;

    await db.delete(events).where(eq(events.id, id));
    return ok(res, { message: 'Event deleted' });
  }

  return err(res, 'Method not allowed', 405);
}
