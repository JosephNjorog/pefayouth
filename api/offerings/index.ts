import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, offerings } from '../../db/client';
import { eq, desc } from 'drizzle-orm';
import { requireRole } from '../../lib/auth';
import { ok, err } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const FINANCE_ROLES = ['super_admin', 'finance_admin'];

  if (req.method === 'GET') {
    const user = await requireRole(req, res, FINANCE_ROLES);
    if (!user) return;

    const { type } = req.query;
    let query = db.select().from(offerings).orderBy(desc(offerings.date)).$dynamic();
    if (type) query = query.where(eq(offerings.type, type as string));
    const rows = await query;
    return ok(res, rows);
  }

  if (req.method === 'POST') {
    const user = await requireRole(req, res, FINANCE_ROLES);
    if (!user) return;

    const { date, type, amount, service, recordedBy } = req.body || {};
    if (!date || !type || !amount) {
      return err(res, 'date, type, and amount are required');
    }

    const [row] = await db.insert(offerings).values({
      date,
      type,
      amount: String(amount),
      service,
      recordedBy: recordedBy || user.name,
    }).returning();

    return ok(res, row, 201);
  }

  return err(res, 'Method not allowed', 405);
}
