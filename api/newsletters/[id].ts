import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, newsletters } from '../../db/client';
import { eq } from 'drizzle-orm';
import { requireRole } from '../../lib/auth';
import { ok, err } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id || typeof id !== 'string') return err(res, 'Newsletter ID required');

  if (req.method === 'GET') {
    const [row] = await db.select().from(newsletters).where(eq(newsletters.id, id)).limit(1);
    if (!row) return err(res, 'Newsletter not found', 404);
    return ok(res, row);
  }

  if (req.method === 'PUT') {
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;

    const { title, content, date, author, status, category } = req.body || {};
    const [updated] = await db
      .update(newsletters)
      .set({ title, content, date, author, status, category, updatedAt: new Date() })
      .where(eq(newsletters.id, id))
      .returning();

    if (!updated) return err(res, 'Newsletter not found', 404);
    return ok(res, updated);
  }

  if (req.method === 'DELETE') {
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;

    await db.delete(newsletters).where(eq(newsletters.id, id));
    return ok(res, { message: 'Newsletter deleted' });
  }

  return err(res, 'Method not allowed', 405);
}
