// Single consolidated API handler — stays within Vercel Hobby 12-function limit
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, users, members, events, attendance, payments, sermons, galleryItems, newsletters, expenses, budgetItems, offerings, meetingNotes } from '../db/client';
import { eq, ilike, or, desc, asc, gte, lte, and, sum, count } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { signJWT, setAuthCookie, clearAuthCookie, requireAuth, requireRole } from '../lib/auth';
import { initiateStkPush, parseMpesaCallback, type DarajaCallbackBody } from '../lib/mpesa';
import { ok, err } from '../lib/helpers';

// ─── Router ──────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Parse path: strip query string and leading /api prefix
  const rawUrl = req.url || '/';
  const urlPath = rawUrl.split('?')[0].replace(/^\/api/, '') || '/';
  const parts = urlPath.split('/').filter(Boolean); // e.g. ['auth','login'] or ['members','123']

  const seg0 = parts[0]; // e.g. 'auth', 'members', 'events'
  const seg1 = parts[1]; // e.g. 'login', '123', 'stkpush'
  const seg2 = parts[2]; // e.g. 'summary'

  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    if (seg0 === 'auth') {
      if (seg1 === 'login')    return await authLogin(req, res);
      if (seg1 === 'logout')   return await authLogout(req, res);
      if (seg1 === 'me')       return await authMe(req, res);
      if (seg1 === 'register') return await authRegister(req, res);
    }

    // ── Members ───────────────────────────────────────────────────────────────
    if (seg0 === 'members') {
      if (!seg1) return await membersCollection(req, res);
      return await memberById(req, res, seg1);
    }

    // ── Events ────────────────────────────────────────────────────────────────
    if (seg0 === 'events') {
      if (!seg1) return await eventsCollection(req, res);
      if (seg2 === 'register') return await eventRegister(req, res, seg1);
      return await eventById(req, res, seg1);
    }

    // ── Attendance ────────────────────────────────────────────────────────────
    if (seg0 === 'attendance') return await attendanceHandler(req, res);

    // ── Payments ──────────────────────────────────────────────────────────────
    if (seg0 === 'payments') {
      if (!seg1) return await paymentsCollection(req, res);
      return await paymentById(req, res, seg1);
    }

    // ── M-Pesa ────────────────────────────────────────────────────────────────
    if (seg0 === 'mpesa') {
      if (seg1 === 'stkpush')  return await mpesaStkPush(req, res);
      if (seg1 === 'callback') return await mpesaCallback(req, res);
    }

    // ── Sermons ───────────────────────────────────────────────────────────────
    if (seg0 === 'sermons') {
      if (!seg1) return await sermonsCollection(req, res);
      return await sermonById(req, res, seg1);
    }

    // ── Gallery ───────────────────────────────────────────────────────────────
    if (seg0 === 'gallery') {
      if (!seg1) return await galleryCollection(req, res);
      return await galleryById(req, res, seg1);
    }

    // ── Newsletters ───────────────────────────────────────────────────────────
    if (seg0 === 'newsletters') {
      if (!seg1) return await newslettersCollection(req, res);
      return await newsletterById(req, res, seg1);
    }

    // ── Expenses ──────────────────────────────────────────────────────────────
    if (seg0 === 'expenses') {
      if (!seg1) return await expensesCollection(req, res);
      return await expenseById(req, res, seg1);
    }

    // ── Budget ────────────────────────────────────────────────────────────────
    if (seg0 === 'budget') {
      if (!seg1) return await budgetCollection(req, res);
      return await budgetById(req, res, seg1);
    }

    // ── Offerings ─────────────────────────────────────────────────────────────
    if (seg0 === 'offerings') return await offeringsHandler(req, res);

    // ── Records ───────────────────────────────────────────────────────────────
    if (seg0 === 'records') {
      if (!seg1) return await recordsCollection(req, res);
      return await recordById(req, res, seg1);
    }

    // ── Finance ───────────────────────────────────────────────────────────────
    if (seg0 === 'finance') {
      if (seg1 === 'summary') return await financeSummary(req, res);
      if (seg1 === 'reports') return await financeReports(req, res);
      if (seg1 === 'stats')   return await financeStats(req, res);
    }

    // ── Cloudinary ────────────────────────────────────────────────────────────
    if (seg0 === 'cloudinary') {
      if (seg1 === 'sign') return await cloudinarySign(req, res);
    }

    return err(res, 'Not found', 404);
  } catch (e: any) {
    console.error('API error:', e);
    return err(res, e.message || 'Internal server error', 500);
  }
}

// ─── Auth Handlers ───────────────────────────────────────────────────────────

async function authLogin(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);
  const { email, password } = req.body || {};
  if (!email || !password) return err(res, 'Email and password are required');

  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (!user) return err(res, 'Invalid email or password', 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return err(res, 'Invalid email or password', 401);

  let name = user.email;
  if (user.memberId) {
    const [member] = await db.select().from(members).where(eq(members.id, user.memberId)).limit(1);
    if (member) name = member.name;
  }

  const token = await signJWT({ id: user.id, email: user.email, role: user.role, name, memberId: user.memberId || undefined });
  setAuthCookie(res, token);
  return ok(res, { id: user.id, email: user.email, role: user.role, name, memberId: user.memberId });
}

async function authRegister(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return err(res, 'Name, email, and password are required');
  if (password.length < 6) return err(res, 'Password must be at least 6 characters');

  const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (existing) return err(res, 'An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, 10);
  const [member] = await db.insert(members).values({
    name,
    email: email.toLowerCase(),
    joinedDate: new Date().toISOString().split('T')[0],
  }).returning();
  const [user] = await db.insert(users).values({
    email: email.toLowerCase(),
    passwordHash,
    role: 'member',
    memberId: member.id,
  }).returning();

  const token = await signJWT({ id: user.id, email: user.email, role: user.role, name: member.name, memberId: member.id });
  setAuthCookie(res, token);
  return ok(res, { id: user.id, email: user.email, role: user.role, name: member.name, memberId: member.id }, 201);
}

async function authLogout(req: VercelRequest, res: VercelResponse) {
  clearAuthCookie(res);
  return ok(res, { message: 'Logged out' });
}

async function authMe(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return err(res, 'Method not allowed', 405);
  const user = await requireAuth(req, res);
  if (!user) return;
  return ok(res, { id: user.id, email: user.email, role: user.role, name: user.name, memberId: user.memberId });
}

// ─── Members ─────────────────────────────────────────────────────────────────

async function membersCollection(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
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
    return ok(res, await query);
  }
  if (req.method === 'POST') {
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;
    const { name, phone, email, ministry, cellGroup, joinedDate } = req.body || {};
    if (!name) return err(res, 'Name is required');
    const [row] = await db.insert(members).values({ name, phone, email, ministry, cellGroup, joinedDate }).returning();
    return ok(res, row, 201);
  }
  return err(res, 'Method not allowed', 405);
}

async function memberById(req: VercelRequest, res: VercelResponse, id: string) {
  if (req.method === 'GET') {
    const user = await requireAuth(req, res);
    if (!user) return;
    if (user.role === 'member' && user.memberId !== id) return err(res, 'Forbidden', 403);
    const [member] = await db.select().from(members).where(eq(members.id, id)).limit(1);
    if (!member) return err(res, 'Member not found', 404);
    const history = await db
      .select({ id: attendance.id, present: attendance.present, date: attendance.date, eventTitle: events.title, eventType: events.type })
      .from(attendance)
      .leftJoin(events, eq(attendance.eventId, events.id))
      .where(eq(attendance.memberId, id))
      .orderBy(desc(attendance.date))
      .limit(50);
    return ok(res, { ...member, attendanceHistory: history });
  }
  if (req.method === 'PUT') {
    const user = await requireAuth(req, res);
    if (!user) return;
    // Members can only update their own phone/email
    if (user.role === 'member') {
      if (user.memberId !== id) return err(res, 'Forbidden', 403);
      const { phone, email } = req.body || {};
      const [updated] = await db.update(members).set({ phone, email, updatedAt: new Date() }).where(eq(members.id, id)).returning();
      if (!updated) return err(res, 'Member not found', 404);
      return ok(res, updated);
    }
    // Admins can update all fields
    if (!['super_admin', 'secretary'].includes(user.role)) return err(res, 'Forbidden', 403);
    const { name, phone, email, ministry, cellGroup, joinedDate, attendanceRate } = req.body || {};
    const [updated] = await db.update(members).set({ name, phone, email, ministry, cellGroup, joinedDate, attendanceRate, updatedAt: new Date() }).where(eq(members.id, id)).returning();
    if (!updated) return err(res, 'Member not found', 404);
    return ok(res, updated);
  }
  if (req.method === 'DELETE') {
    const user = await requireRole(req, res, ['super_admin']);
    if (!user) return;
    await db.delete(members).where(eq(members.id, id));
    return ok(res, { message: 'Member deleted' });
  }
  return err(res, 'Method not allowed', 405);
}

// ─── Events ──────────────────────────────────────────────────────────────────

async function eventsCollection(req: VercelRequest, res: VercelResponse) {
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
    return ok(res, await query);
  }
  if (req.method === 'POST') {
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;
    const { title, description, date, time, location, type, isPaid, price, capacity } = req.body || {};
    if (!title || !date || !time || !location || !type) return err(res, 'title, date, time, location, and type are required');
    const [row] = await db.insert(events).values({ title, description, date, time, location, type, isPaid: isPaid ?? false, price: price ? String(price) : '0', capacity: capacity ?? 100, registered: 0 }).returning();
    return ok(res, row, 201);
  }
  return err(res, 'Method not allowed', 405);
}

async function eventById(req: VercelRequest, res: VercelResponse, id: string) {
  if (req.method === 'GET') {
    const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
    if (!event) return err(res, 'Event not found', 404);
    const [{ count: presentCount }] = await db.select({ count: count() }).from(attendance).where(eq(attendance.eventId, id));
    return ok(res, { ...event, presentCount: Number(presentCount) });
  }
  if (req.method === 'PUT') {
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;
    const { title, description, date, time, location, type, isPaid, price, capacity, registered } = req.body || {};
    const [updated] = await db.update(events).set({ title, description, date, time, location, type, isPaid, price: price ? String(price) : undefined, capacity, registered, updatedAt: new Date() }).where(eq(events.id, id)).returning();
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

// ─── Event Registration (free RSVP) ──────────────────────────────────────────

async function eventRegister(req: VercelRequest, res: VercelResponse, id: string) {
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);
  const user = await requireAuth(req, res);
  if (!user) return;
  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!event) return err(res, 'Event not found', 404);
  if (event.isPaid) return err(res, 'Paid events require payment via M-Pesa', 400);
  if (event.registered >= event.capacity) return err(res, 'Event is fully booked', 400);
  // Increment registered count
  const [updated] = await db.update(events).set({ registered: event.registered + 1, updatedAt: new Date() }).where(eq(events.id, id)).returning();
  return ok(res, { message: 'Registered successfully', event: updated });
}

// ─── Attendance ───────────────────────────────────────────────────────────────

async function attendanceHandler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const user = await requireAuth(req, res);
    if (!user) return;
    const { eventId, memberId } = req.query;
    if (user.role === 'member') {
      const rows = await db
        .select({ id: attendance.id, present: attendance.present, date: attendance.date, eventTitle: events.title, eventType: events.type })
        .from(attendance)
        .leftJoin(events, eq(attendance.eventId, events.id))
        .where(eq(attendance.memberId, user.memberId!))
        .orderBy(desc(attendance.date))
        .limit(50);
      return ok(res, rows);
    }
    if (eventId) {
      const rows = await db
        .select({ id: attendance.id, present: attendance.present, date: attendance.date, memberId: attendance.memberId, memberName: members.name })
        .from(attendance)
        .leftJoin(members, eq(attendance.memberId, members.id))
        .where(eq(attendance.eventId, eventId as string))
        .orderBy(members.name);
      return ok(res, rows);
    }
    const rows = await db
      .select({ id: attendance.id, eventId: attendance.eventId, eventTitle: events.title, date: attendance.date, present: attendance.present })
      .from(attendance)
      .leftJoin(events, eq(attendance.eventId, events.id))
      .orderBy(desc(attendance.date))
      .limit(100);
    return ok(res, rows);
  }
  if (req.method === 'POST') {
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;
    const { eventId, records } = req.body || {};
    if (!eventId || !Array.isArray(records)) return err(res, 'eventId and records[] are required');
    const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event) return err(res, 'Event not found', 404);
    const values = records.map((r: { memberId: string; present: boolean }) => ({ eventId, memberId: r.memberId, present: r.present ?? true, date: event.date }));
    await db.insert(attendance).values(values).onConflictDoUpdate({ target: [attendance.eventId, attendance.memberId], set: { present: attendance.present } });
    for (const r of records) {
      const allRecords = await db.select().from(attendance).where(eq(attendance.memberId, r.memberId));
      if (allRecords.length > 0) {
        const presentCount = allRecords.filter((a) => a.present).length;
        const rate = ((presentCount / allRecords.length) * 100).toFixed(2);
        await db.update(members).set({ attendanceRate: rate }).where(eq(members.id, r.memberId));
      }
    }
    return ok(res, { message: 'Attendance recorded', count: values.length });
  }
  return err(res, 'Method not allowed', 405);
}

// ─── Payments ─────────────────────────────────────────────────────────────────

async function paymentsCollection(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const user = await requireRole(req, res, ['super_admin', 'finance_admin']);
    if (!user) return;
    const { eventId, status } = req.query;
    let query = db
      .select({ id: payments.id, amount: payments.amount, status: payments.status, date: payments.date, transactionId: payments.transactionId, phoneNumber: payments.phoneNumber, memberId: payments.memberId, eventId: payments.eventId, memberName: members.name, eventTitle: events.title })
      .from(payments)
      .leftJoin(members, eq(payments.memberId, members.id))
      .leftJoin(events, eq(payments.eventId, events.id))
      .orderBy(desc(payments.createdAt))
      .$dynamic();
    if (eventId) query = query.where(eq(payments.eventId, eventId as string));
    if (status) query = query.where(eq(payments.status, status as string));
    return ok(res, await query);
  }
  if (req.method === 'POST') {
    const user = await requireAuth(req, res);
    if (!user) return;
    const { memberId, eventId, amount, phoneNumber } = req.body || {};
    if (!eventId || !amount) return err(res, 'eventId and amount are required');
    const [row] = await db.insert(payments).values({ memberId: memberId || user.memberId, eventId, amount: String(amount), status: 'pending', date: new Date().toISOString().split('T')[0], phoneNumber }).returning();
    return ok(res, row, 201);
  }
  return err(res, 'Method not allowed', 405);
}

async function paymentById(req: VercelRequest, res: VercelResponse, id: string) {
  if (req.method === 'GET') {
    const user = await requireAuth(req, res);
    if (!user) return;
    const [row] = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    if (!row) return err(res, 'Payment not found', 404);
    if (user.role === 'member' && row.memberId !== user.memberId) return err(res, 'Forbidden', 403);
    return ok(res, row);
  }
  if (req.method === 'PUT') {
    const user = await requireRole(req, res, ['super_admin', 'finance_admin']);
    if (!user) return;
    const { status, transactionId } = req.body || {};
    const [updated] = await db.update(payments).set({ status, transactionId, updatedAt: new Date() }).where(eq(payments.id, id)).returning();
    if (!updated) return err(res, 'Payment not found', 404);
    return ok(res, updated);
  }
  return err(res, 'Method not allowed', 405);
}

// ─── M-Pesa ───────────────────────────────────────────────────────────────────

async function mpesaStkPush(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);
  const user = await requireAuth(req, res);
  if (!user) return;
  const { phone, amount, eventId, eventTitle, paymentId } = req.body || {};
  if (!phone || !amount || !eventId) return err(res, 'phone, amount, and eventId are required');
  try {
    const callbackUrl = process.env.MPESA_CALLBACK_URL || `https://${req.headers.host}/api/mpesa/callback`;
    const result = await initiateStkPush({ phone, amount: Number(amount), accountRef: eventTitle || 'PEFA Youth', description: 'Event Payment', callbackUrl });
    if (result.ResponseCode !== '0') return err(res, result.ResponseDescription || 'STK Push failed');
    const today = new Date().toISOString().split('T')[0];
    let payment;
    if (paymentId) {
      const [updated] = await db.update(payments).set({ mpesaCheckoutRequestId: result.CheckoutRequestID, phoneNumber: phone, status: 'pending', updatedAt: new Date() }).where(eq(payments.id, paymentId)).returning();
      payment = updated;
    } else {
      const [created] = await db.insert(payments).values({ memberId: user.memberId || null, eventId, amount: String(amount), status: 'pending', date: today, phoneNumber: phone, mpesaCheckoutRequestId: result.CheckoutRequestID }).returning();
      payment = created;
    }
    return ok(res, { paymentId: payment.id, checkoutRequestId: result.CheckoutRequestID, customerMessage: result.CustomerMessage });
  } catch (e: any) {
    console.error('STK Push error:', e);
    return err(res, e.message || 'Failed to initiate M-Pesa payment', 500);
  }
}

async function mpesaCallback(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const body = req.body as DarajaCallbackBody;
    const { checkoutRequestId, success, transactionId } = parseMpesaCallback(body);
    const [payment] = await db.select().from(payments).where(eq(payments.mpesaCheckoutRequestId, checkoutRequestId)).limit(1);
    if (payment) {
      await db.update(payments).set({ status: success ? 'confirmed' : 'failed', transactionId: transactionId || null, updatedAt: new Date() }).where(eq(payments.id, payment.id));
    }
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (e) {
    console.error('M-Pesa callback error:', e);
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Acknowledged' });
  }
}

// ─── Sermons ──────────────────────────────────────────────────────────────────

async function sermonsCollection(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { type } = req.query;
    let query = db.select().from(sermons).orderBy(desc(sermons.date)).$dynamic();
    if (type) query = query.where(eq(sermons.type, type as string));
    return ok(res, await query);
  }
  if (req.method === 'POST') {
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;
    const { title, speaker, date, duration, type, description, url } = req.body || {};
    if (!title || !speaker || !date || !type) return err(res, 'title, speaker, date, and type are required');
    const [row] = await db.insert(sermons).values({ title, speaker, date, duration, type, description, url }).returning();
    return ok(res, row, 201);
  }
  return err(res, 'Method not allowed', 405);
}

async function sermonById(req: VercelRequest, res: VercelResponse, id: string) {
  if (req.method === 'GET') {
    const [row] = await db.select().from(sermons).where(eq(sermons.id, id)).limit(1);
    if (!row) return err(res, 'Sermon not found', 404);
    return ok(res, row);
  }
  if (req.method === 'PUT') {
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;
    const { title, speaker, date, duration, type, description, url } = req.body || {};
    const [updated] = await db.update(sermons).set({ title, speaker, date, duration, type, description, url }).where(eq(sermons.id, id)).returning();
    if (!updated) return err(res, 'Sermon not found', 404);
    return ok(res, updated);
  }
  if (req.method === 'DELETE') {
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;
    await db.delete(sermons).where(eq(sermons.id, id));
    return ok(res, { message: 'Sermon deleted' });
  }
  return err(res, 'Method not allowed', 405);
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

async function galleryCollection(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { type } = req.query;
    let query = db.select().from(galleryItems).orderBy(desc(galleryItems.date)).$dynamic();
    if (type) query = query.where(eq(galleryItems.type, type as string));
    return ok(res, await query);
  }
  if (req.method === 'POST') {
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;
    const { title, date, type, url, event } = req.body || {};
    if (!title || !date || !type || !url) return err(res, 'title, date, type, and url are required');
    const [row] = await db.insert(galleryItems).values({ title, date, type, url, event }).returning();
    return ok(res, row, 201);
  }
  return err(res, 'Method not allowed', 405);
}

async function galleryById(req: VercelRequest, res: VercelResponse, id: string) {
  if (req.method === 'DELETE') {
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;
    await db.delete(galleryItems).where(eq(galleryItems.id, id));
    return ok(res, { message: 'Gallery item deleted' });
  }
  return err(res, 'Method not allowed', 405);
}

// ─── Newsletters ─────────────────────────────────────────────────────────────

async function newslettersCollection(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { status, category } = req.query;
    let query = db.select().from(newsletters).orderBy(desc(newsletters.date)).$dynamic();
    if (status) query = query.where(eq(newsletters.status, status as string));
    if (category) query = query.where(eq(newsletters.category, category as string));
    return ok(res, await query);
  }
  if (req.method === 'POST') {
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;
    const { title, content, date, author, status, category } = req.body || {};
    if (!title || !category) return err(res, 'title and category are required');
    const today = new Date().toISOString().split('T')[0];
    const [row] = await db.insert(newsletters).values({ title, content: content || '', date: date || today, author: author || user.name, status: status || 'draft', category }).returning();
    return ok(res, row, 201);
  }
  return err(res, 'Method not allowed', 405);
}

async function newsletterById(req: VercelRequest, res: VercelResponse, id: string) {
  if (req.method === 'GET') {
    const [row] = await db.select().from(newsletters).where(eq(newsletters.id, id)).limit(1);
    if (!row) return err(res, 'Newsletter not found', 404);
    return ok(res, row);
  }
  if (req.method === 'PUT') {
    const user = await requireRole(req, res, ['super_admin', 'secretary']);
    if (!user) return;
    const { title, content, date, author, status, category } = req.body || {};
    const [updated] = await db.update(newsletters).set({ title, content, date, author, status, category, updatedAt: new Date() }).where(eq(newsletters.id, id)).returning();
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

// ─── Expenses ─────────────────────────────────────────────────────────────────

async function expensesCollection(req: VercelRequest, res: VercelResponse) {
  const FINANCE_ROLES = ['super_admin', 'finance_admin'];
  if (req.method === 'GET') {
    const user = await requireRole(req, res, FINANCE_ROLES);
    if (!user) return;
    const { status, category } = req.query;
    let query = db.select().from(expenses).orderBy(desc(expenses.date)).$dynamic();
    if (status) query = query.where(eq(expenses.status, status as string));
    if (category) query = query.where(eq(expenses.category, category as string));
    return ok(res, await query);
  }
  if (req.method === 'POST') {
    const user = await requireRole(req, res, FINANCE_ROLES);
    if (!user) return;
    const { category, description, amount, date, approvedBy, receiptNo } = req.body || {};
    if (!category || !description || !amount || !date) return err(res, 'category, description, amount, and date are required');
    const [row] = await db.insert(expenses).values({ category, description, amount: String(amount), date, approvedBy, status: 'pending', receiptNo }).returning();
    return ok(res, row, 201);
  }
  return err(res, 'Method not allowed', 405);
}

async function expenseById(req: VercelRequest, res: VercelResponse, id: string) {
  const FINANCE_ROLES = ['super_admin', 'finance_admin'];
  if (req.method === 'PUT') {
    const user = await requireRole(req, res, FINANCE_ROLES);
    if (!user) return;
    const { category, description, amount, date, approvedBy, status, receiptNo } = req.body || {};
    const [updated] = await db.update(expenses).set({ category, description, amount: amount ? String(amount) : undefined, date, approvedBy, status, receiptNo, updatedAt: new Date() }).where(eq(expenses.id, id)).returning();
    if (!updated) return err(res, 'Expense not found', 404);
    return ok(res, updated);
  }
  if (req.method === 'DELETE') {
    const user = await requireRole(req, res, FINANCE_ROLES);
    if (!user) return;
    await db.delete(expenses).where(eq(expenses.id, id));
    return ok(res, { message: 'Expense deleted' });
  }
  return err(res, 'Method not allowed', 405);
}

// ─── Budget ───────────────────────────────────────────────────────────────────

async function budgetCollection(req: VercelRequest, res: VercelResponse) {
  const FINANCE_ROLES = ['super_admin', 'finance_admin'];
  if (req.method === 'GET') {
    const user = await requireRole(req, res, FINANCE_ROLES);
    if (!user) return;
    const { period } = req.query;
    let query = db.select().from(budgetItems).orderBy(budgetItems.category).$dynamic();
    if (period) query = query.where(eq(budgetItems.period, period as string));
    return ok(res, await query);
  }
  if (req.method === 'POST') {
    const user = await requireRole(req, res, FINANCE_ROLES);
    if (!user) return;
    const { category, allocated, spent, period } = req.body || {};
    if (!category || !allocated || !period) return err(res, 'category, allocated, and period are required');
    const [row] = await db.insert(budgetItems).values({ category, allocated: String(allocated), spent: spent ? String(spent) : '0', period }).returning();
    return ok(res, row, 201);
  }
  return err(res, 'Method not allowed', 405);
}

async function budgetById(req: VercelRequest, res: VercelResponse, id: string) {
  const FINANCE_ROLES = ['super_admin', 'finance_admin'];
  if (req.method === 'PUT') {
    const user = await requireRole(req, res, FINANCE_ROLES);
    if (!user) return;
    const { category, allocated, spent, period } = req.body || {};
    const [updated] = await db.update(budgetItems).set({ category, allocated: allocated ? String(allocated) : undefined, spent: spent !== undefined ? String(spent) : undefined, period, updatedAt: new Date() }).where(eq(budgetItems.id, id)).returning();
    if (!updated) return err(res, 'Budget item not found', 404);
    return ok(res, updated);
  }
  if (req.method === 'DELETE') {
    const user = await requireRole(req, res, FINANCE_ROLES);
    if (!user) return;
    await db.delete(budgetItems).where(eq(budgetItems.id, id));
    return ok(res, { message: 'Budget item deleted' });
  }
  return err(res, 'Method not allowed', 405);
}

// ─── Offerings ────────────────────────────────────────────────────────────────

async function offeringsHandler(req: VercelRequest, res: VercelResponse) {
  const FINANCE_ROLES = ['super_admin', 'finance_admin'];
  if (req.method === 'GET') {
    const user = await requireRole(req, res, FINANCE_ROLES);
    if (!user) return;
    const { type } = req.query;
    let query = db.select().from(offerings).orderBy(desc(offerings.date)).$dynamic();
    if (type) query = query.where(eq(offerings.type, type as string));
    return ok(res, await query);
  }
  if (req.method === 'POST') {
    const user = await requireRole(req, res, FINANCE_ROLES);
    if (!user) return;
    const { date, type, amount, service, recordedBy } = req.body || {};
    if (!date || !type || !amount) return err(res, 'date, type, and amount are required');
    const [row] = await db.insert(offerings).values({ date, type, amount: String(amount), service, recordedBy: recordedBy || user.name }).returning();
    return ok(res, row, 201);
  }
  return err(res, 'Method not allowed', 405);
}

// ─── Records (Meeting Notes) ──────────────────────────────────────────────────

async function recordsCollection(req: VercelRequest, res: VercelResponse) {
  const ALLOWED = ['super_admin', 'secretary'];
  if (req.method === 'GET') {
    const user = await requireRole(req, res, ALLOWED);
    if (!user) return;
    const { type } = req.query;
    let query = db.select().from(meetingNotes).orderBy(desc(meetingNotes.date)).$dynamic();
    if (type) query = query.where(eq(meetingNotes.type, type as string));
    return ok(res, await query);
  }
  if (req.method === 'POST') {
    const user = await requireRole(req, res, ALLOWED);
    if (!user) return;
    const { title, date, author, content, type } = req.body || {};
    if (!title || !date || !type) return err(res, 'title, date, and type are required');
    const [row] = await db.insert(meetingNotes).values({ title, date, author: author || user.name, content, type }).returning();
    return ok(res, row, 201);
  }
  return err(res, 'Method not allowed', 405);
}

async function recordById(req: VercelRequest, res: VercelResponse, id: string) {
  const ALLOWED = ['super_admin', 'secretary'];
  if (req.method === 'PUT') {
    const user = await requireRole(req, res, ALLOWED);
    if (!user) return;
    const { title, date, author, content, type } = req.body || {};
    const [updated] = await db.update(meetingNotes).set({ title, date, author, content, type, updatedAt: new Date() }).where(eq(meetingNotes.id, id)).returning();
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

// ─── Finance ──────────────────────────────────────────────────────────────────

async function financeSummary(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return err(res, 'Method not allowed', 405);
  const user = await requireRole(req, res, ['super_admin', 'finance_admin']);
  if (!user) return;
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    const endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
    const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const [{ totalOfferings }] = await db.select({ totalOfferings: sum(offerings.amount) }).from(offerings).where(and(gte(offerings.date, startDate), lte(offerings.date, endDateStr)));
    const [{ totalPayments }] = await db.select({ totalPayments: sum(payments.amount) }).from(payments).where(and(eq(payments.status, 'confirmed'), gte(payments.date, startDate), lte(payments.date, endDateStr)));
    const [{ totalExpenses }] = await db.select({ totalExpenses: sum(expenses.amount) }).from(expenses).where(and(eq(expenses.status, 'approved'), gte(expenses.date, startDate), lte(expenses.date, endDateStr)));
    const income = (Number(totalOfferings) || 0) + (Number(totalPayments) || 0);
    const exp = Number(totalExpenses) || 0;
    months.push({ month: monthLabel, income, expenses: exp, balance: income - exp });
  }
  return ok(res, months);
}

async function financeReports(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return err(res, 'Method not allowed', 405);
  const user = await requireRole(req, res, ['super_admin', 'finance_admin']);
  if (!user) return;
  const offeringsByType = await db.select({ type: offerings.type, total: sum(offerings.amount) }).from(offerings).groupBy(offerings.type);
  const expensesByCategory = await db.select({ category: expenses.category, total: sum(expenses.amount), status: expenses.status }).from(expenses).groupBy(expenses.category, expenses.status);
  const [{ totalConfirmed }] = await db.select({ totalConfirmed: sum(payments.amount) }).from(payments).where(eq(payments.status, 'confirmed'));
  const [{ totalPending }] = await db.select({ totalPending: sum(payments.amount) }).from(payments).where(eq(payments.status, 'pending'));
  const [{ memberCount }] = await db.select({ memberCount: count() }).from(members);
  return ok(res, {
    offeringsByType: offeringsByType.map((r) => ({ type: r.type, total: Number(r.total) || 0 })),
    expensesByCategory: expensesByCategory.map((r) => ({ category: r.category, total: Number(r.total) || 0, status: r.status })),
    paymentStats: { confirmedTotal: Number(totalConfirmed) || 0, pendingTotal: Number(totalPending) || 0 },
    memberCount: Number(memberCount) || 0,
  });
}

async function financeStats(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return err(res, 'Method not allowed', 405);
  const user = await requireRole(req, res, ['super_admin', 'finance_admin', 'secretary']);
  if (!user) return;
  const today = new Date().toISOString().split('T')[0];
  const [{ memberCount }] = await db.select({ memberCount: count() }).from(members);
  const [{ eventCount }] = await db.select({ eventCount: count() }).from(events).where(gte(events.date, today));
  const [{ revenue }] = await db.select({ revenue: sum(payments.amount) }).from(payments).where(eq(payments.status, 'confirmed'));
  const allMembers = await db.select({ attendanceRate: members.attendanceRate }).from(members);
  const avgAttendance = allMembers.length ? allMembers.reduce((acc, m) => acc + (Number(m.attendanceRate) || 0), 0) / allMembers.length : 0;
  const [{ nlCount }] = await db.select({ nlCount: count() }).from(newsletters).where(eq(newsletters.status, 'published'));
  const budgets = await db.select().from(budgetItems);
  const totalAllocated = budgets.reduce((a, b) => a + (Number(b.allocated) || 0), 0);
  const totalSpent = budgets.reduce((a, b) => a + (Number(b.spent) || 0), 0);
  const budgetUtilization = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
  return ok(res, {
    memberCount: Number(memberCount),
    upcomingEvents: Number(eventCount),
    totalRevenue: Number(revenue) || 0,
    avgAttendanceRate: Math.round(avgAttendance),
    publishedNewsletters: Number(nlCount),
    budgetUtilization,
    totalAllocated,
    totalSpent,
  });
}
