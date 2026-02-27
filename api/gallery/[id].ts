import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, galleryItems } from '../../db/client';
import { eq } from 'drizzle-orm';
import { requireRole } from '../../lib/auth';
import { ok, err } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id || typeof id !== 'string') return err(res, 'Gallery item ID required');

  if (req.method === 'DELETE') {
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;

    await db.delete(galleryItems).where(eq(galleryItems.id, id));
    return ok(res, { message: 'Gallery item deleted' });
  }

  return err(res, 'Method not allowed', 405);
}
