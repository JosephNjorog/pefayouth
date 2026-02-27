import { pgTable, uuid, text, boolean, numeric, date, timestamp, integer, unique } from 'drizzle-orm/pg-core';

// ─── Users (authentication) ───────────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(), // 'member' | 'super_admin' | 'finance_admin' | 'secretary'
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Members ──────────────────────────────────────────────────────────────────
export const members = pgTable('members', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  ministry: text('ministry'),
  cellGroup: text('cell_group'),
  joinedDate: date('joined_date'),
  attendanceRate: numeric('attendance_rate', { precision: 5, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Events ───────────────────────────────────────────────────────────────────
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  date: date('date').notNull(),
  time: text('time').notNull(),
  location: text('location').notNull(),
  type: text('type').notNull(), // 'service'|'seminar'|'retreat'|'camp'|'fellowship'|'outreach'
  isPaid: boolean('is_paid').default(false),
  price: numeric('price', { precision: 10, scale: 2 }).default('0'),
  capacity: integer('capacity').default(100),
  registered: integer('registered').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Attendance ───────────────────────────────────────────────────────────────
export const attendance = pgTable('attendance', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }),
  present: boolean('present').default(true),
  date: date('date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
  uniq: unique().on(t.eventId, t.memberId),
}));

// ─── Payments ─────────────────────────────────────────────────────────────────
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  memberId: uuid('member_id').references(() => members.id),
  eventId: uuid('event_id').references(() => events.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'), // 'pending'|'confirmed'|'failed'
  date: date('date').notNull(),
  transactionId: text('transaction_id'),
  phoneNumber: text('phone_number'),
  mpesaCheckoutRequestId: text('mpesa_checkout_request_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Sermons ──────────────────────────────────────────────────────────────────
export const sermons = pgTable('sermons', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  speaker: text('speaker').notNull(),
  date: date('date').notNull(),
  duration: text('duration'),
  type: text('type').notNull(), // 'audio'|'video'
  description: text('description'),
  url: text('url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Gallery ──────────────────────────────────────────────────────────────────
export const galleryItems = pgTable('gallery_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  date: date('date').notNull(),
  type: text('type').notNull(), // 'photo'|'video'
  url: text('url').notNull(),
  event: text('event'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Meeting Notes / Records ──────────────────────────────────────────────────
export const meetingNotes = pgTable('meeting_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  date: date('date').notNull(),
  author: text('author').notNull(),
  content: text('content'),
  type: text('type').notNull(), // 'meeting'|'event-note'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Newsletters ──────────────────────────────────────────────────────────────
export const newsletters = pgTable('newsletters', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content'),
  date: date('date').notNull(),
  author: text('author').notNull(),
  status: text('status').notNull().default('draft'), // 'published'|'draft'
  category: text('category').notNull(), // 'announcement'|'devotional'|'update'|'prayer'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Expenses ─────────────────────────────────────────────────────────────────
export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  date: date('date').notNull(),
  approvedBy: text('approved_by'),
  status: text('status').notNull().default('pending'), // 'approved'|'pending'|'rejected'
  receiptNo: text('receipt_no'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Budget Items ─────────────────────────────────────────────────────────────
export const budgetItems = pgTable('budget_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: text('category').notNull(),
  allocated: numeric('allocated', { precision: 10, scale: 2 }).notNull(),
  spent: numeric('spent', { precision: 10, scale: 2 }).default('0'),
  period: text('period').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Offerings ────────────────────────────────────────────────────────────────
export const offerings = pgTable('offerings', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').notNull(),
  type: text('type').notNull(), // 'tithe'|'offering'|'special'|'missions'
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  service: text('service'),
  recordedBy: text('recorded_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Type exports ─────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type Member = typeof members.$inferSelect;
export type ChurchEvent = typeof events.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Sermon = typeof sermons.$inferSelect;
export type GalleryItem = typeof galleryItems.$inferSelect;
export type MeetingNote = typeof meetingNotes.$inferSelect;
export type Newsletter = typeof newsletters.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type BudgetItem = typeof budgetItems.$inferSelect;
export type Offering = typeof offerings.$inferSelect;
