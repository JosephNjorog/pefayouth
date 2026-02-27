import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, galleryItems } from '../../db/client';
import { eq, desc } from 'drizzle-orm';
import { requireRole } from '../../lib/auth';
import { ok, err } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { type } = req.query;
    let query = db.select().from(galleryItems).orderBy(desc(galleryItems.date)).$dynamic();
    if (type) query = query.where(eq(galleryItems.type, type as string));
    const rows = await query;
    return ok(res, rows);
  }

  if (req.method === 'POST') {
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;

    const { title, date, type, url, event } = req.body || {};
    if (!title || !date || !type || !url) {
      return err(res, 'title, date, type, and url are required');
    }

    const [row] = await db.insert(galleryItems).values({ title, date, type, url, event }).returning();
    return ok(res, row, 201);
  }

  return err(res, 'Method not allowed', 405);
}
