import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, events } from '../../db/client';
import { eq, gte, desc, asc } from 'drizzle-orm';
import { requireRole } from '../../lib/auth';
import { ok, err } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { type, upcoming } = req.query;
    let query = db.select().from(events).$dynamic();

    if (type) query = query.where(eq(events.type, type as string));
    if (upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0];
      query = query.where(gte(events.date, today)).orderBy(asc(events.date));
    } else {
      query = query.orderBy(desc(events.date));
    }

    const rows = await query;
    return ok(res, rows);
  }

  if (req.method === 'POST') {
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;

    const { title, description, date, time, location, type, isPaid, price, capacity } = req.body || {};
    if (!title || !date || !time || !location || !type) {
      return err(res, 'title, date, time, location, and type are required');
    }

    const [row] = await db.insert(events).values({
      title, description, date, time, location, type,
      isPaid: isPaid ?? false,
      price: price ? String(price) : '0',
      capacity: capacity ?? 100,
      registered: 0,
    }).returning();

    return ok(res, row, 201);
  }

  return err(res, 'Method not allowed', 405);
}
