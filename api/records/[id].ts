import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, meetingNotes } from '../../db/client';
import { eq } from 'drizzle-orm';
import { requireRole } from '../../lib/auth';
import { ok, err } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id || typeof id !== 'string') return err(res, 'Record ID required');

  const ALLOWED = ['super_admin', 'secretary'];

  if (req.method === 'PUT') {
    const user = await requireRole(req, res, ALLOWED);
    if (!user) return;

    const { title, date, author, content, type } = req.body || {};
    const [updated] = await db
      .update(meetingNotes)
      .set({ title, date, author, content, type, updatedAt: new Date() })
      .where(eq(meetingNotes.id, id))
      .returning();

    if (!updated) return err(res, 'Record not found', 404);
    return ok(res, updated);
  }

  if (req.method === 'DELETE') {
    const user = await requireRole(req, res, ALLOWED);
    if (!user) return;

    await db.delete(meetingNotes).where(eq(meetingNotes.id, id));
    return ok(res, { message: 'Record deleted' });
  }

  return err(res, 'Method not allowed', 405);
}
