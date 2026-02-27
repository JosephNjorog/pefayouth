import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, meetingNotes } from '../../db/client';
import { eq, desc } from 'drizzle-orm';
import { requireRole } from '../../lib/auth';
import { ok, err } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ALLOWED = ['super_admin', 'secretary'];

  if (req.method === 'GET') {
    const user = await requireRole(req, res, ALLOWED);
    if (!user) return;

    const { type } = req.query;
    let query = db.select().from(meetingNotes).orderBy(desc(meetingNotes.date)).$dynamic();
    if (type) query = query.where(eq(meetingNotes.type, type as string));
    const rows = await query;
    return ok(res, rows);
  }

  if (req.method === 'POST') {
    const user = await requireRole(req, res, ALLOWED);
    if (!user) return;

    const { title, date, author, content, type } = req.body || {};
    if (!title || !date || !type) return err(res, 'title, date, and type are required');

    const [row] = await db.insert(meetingNotes).values({
      title,
      date,
      author: author || user.name,
      content,
      type,
    }).returning();

    return ok(res, row, 201);
  }

  return err(res, 'Method not allowed', 405);
}
