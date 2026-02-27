import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, members } from '../../db/client';
import { eq, ilike, or, desc } from 'drizzle-orm';
import { requireRole } from '../../lib/auth';
import { ok, err } from '../../lib/helpers';

const ALLOWED_ROLES = ['super_admin', 'secretary'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    // Public endpoint — member list for internal pages
    const user = await requireRole(req, res, ['super_admin', 'secretary', 'finance_admin']);
    if (!user) return;

    const { search, ministry, cellGroup } = req.query;
    let query = db.select().from(members).orderBy(desc(members.createdAt)).$dynamic();

    if (search) {
      const term = `%${search}%`;
      query = query.where(or(ilike(members.name, term), ilike(members.email, term)));
    }
    if (ministry) query = query.where(eq(members.ministry, ministry as string));
    if (cellGroup) query = query.where(eq(members.cellGroup, cellGroup as string));

    const rows = await query;
    return ok(res, rows);
  }

  if (req.method === 'POST') {
    const user = await requireRole(req, res, ALLOWED_ROLES);
    if (!user) return;

    const { name, phone, email, ministry, cellGroup, joinedDate } = req.body || {};
    if (!name) return err(res, 'Name is required');

    const [row] = await db.insert(members).values({ name, phone, email, ministry, cellGroup, joinedDate }).returning();
    return ok(res, row, 201);
  }

  return err(res, 'Method not allowed', 405);
}
