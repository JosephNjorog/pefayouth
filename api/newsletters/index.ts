import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, newsletters } from '../../db/client';
import { eq, desc } from 'drizzle-orm';
import { requireRole } from '../../lib/auth';
import { ok, err } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { status, category } = req.query;
    let query = db.select().from(newsletters).orderBy(desc(newsletters.date)).$dynamic();
    if (status) query = query.where(eq(newsletters.status, status as string));
    if (category) query = query.where(eq(newsletters.category, category as string));
    const rows = await query;
    return ok(res, rows);
  }

  if (req.method === 'POST') {
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;

    const { title, content, date, author, status, category } = req.body || {};
    if (!title || !category) return err(res, 'title and category are required');

    const today = new Date().toISOString().split('T')[0];
    const [row] = await db.insert(newsletters).values({
      title,
      content: content || '',
      date: date || today,
      author: author || user.name,
      status: status || 'draft',
      category,
    }).returning();

    return ok(res, row, 201);
  }

  return err(res, 'Method not allowed', 405);
}
