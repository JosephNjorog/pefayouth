const BASE = '';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    let msg = `Request failed: ${res.status}`;
    try { const j = await res.json(); msg = j.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authLogin = (email: string, password: string) =>
  apiFetch<{ id: string; email: string; role: string; name: string; memberId?: string }>(
    '/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }
  );

export const authLogout = () => apiFetch('/api/auth/logout', { method: 'POST' });

export const authMe = () =>
  apiFetch<{ id: string; email: string; role: string; name: string; memberId?: string }>('/api/auth/me');

// ─── Members ─────────────────────────────────────────────────────────────────
export interface Member {
  id: string; name: string; phone?: string; email?: string;
  ministry?: string; cellGroup?: string; joinedDate?: string;
  attendanceRate?: string; createdAt?: string;
  attendanceHistory?: AttendanceEntry[];
}
export interface AttendanceEntry {
  id: string; present: boolean; date: string;
  eventTitle?: string; eventType?: string;
}

export const getMembers = (params?: { search?: string; ministry?: string; cellGroup?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<Member[]>(`/api/members${q ? `?${q}` : ''}`);
};
export const getMember = (id: string) => apiFetch<Member>(`/api/members/${id}`);
export const createMember = (data: Partial<Member>) =>
  apiFetch<Member>('/api/members', { method: 'POST', body: JSON.stringify(data) });
export const updateMember = (id: string, data: Partial<Member>) =>
  apiFetch<Member>(`/api/members/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMember = (id: string) =>
  apiFetch(`/api/members/${id}`, { method: 'DELETE' });

// ─── Events ──────────────────────────────────────────────────────────────────
export interface ChurchEvent {
  id: string; title: string; description?: string; date: string; time: string;
  location: string; type: string; isPaid: boolean; price?: string;
  capacity: number; registered: number; createdAt?: string;
}

export const getEvents = (params?: { type?: string; upcoming?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<ChurchEvent[]>(`/api/events${q ? `?${q}` : ''}`);
};
export const getEvent = (id: string) => apiFetch<ChurchEvent & { presentCount: number }>(`/api/events/${id}`);
export const createEvent = (data: Partial<ChurchEvent>) =>
  apiFetch<ChurchEvent>('/api/events', { method: 'POST', body: JSON.stringify(data) });
export const updateEvent = (id: string, data: Partial<ChurchEvent>) =>
  apiFetch<ChurchEvent>(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteEvent = (id: string) =>
  apiFetch(`/api/events/${id}`, { method: 'DELETE' });
export const registerForEvent = (id: string) =>
  apiFetch<{ message: string }>(`/api/events/${id}/register`, { method: 'POST' });

// ─── Attendance ───────────────────────────────────────────────────────────────
export interface AttendanceRecord {
  id: string; eventId?: string; memberId?: string; eventTitle?: string;
  memberName?: string; present: boolean; date: string; eventType?: string;
}
export const getAttendance = (params?: { eventId?: string; memberId?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<AttendanceRecord[]>(`/api/attendance${q ? `?${q}` : ''}`);
};
export const recordAttendance = (eventId: string, records: { memberId: string; present: boolean }[]) =>
  apiFetch('/api/attendance', { method: 'POST', body: JSON.stringify({ eventId, records }) });

// ─── Payments ─────────────────────────────────────────────────────────────────
export interface Payment {
  id: string; memberId?: string; eventId?: string; amount: string; status: string;
  date: string; transactionId?: string; phoneNumber?: string;
  memberName?: string; eventTitle?: string; mpesaCheckoutRequestId?: string;
}
export const getPayments = (params?: { eventId?: string; status?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<Payment[]>(`/api/payments${q ? `?${q}` : ''}`);
};
export const getPayment = (id: string) => apiFetch<Payment>(`/api/payments/${id}`);
export const createPayment = (data: Partial<Payment>) =>
  apiFetch<Payment>('/api/payments', { method: 'POST', body: JSON.stringify(data) });
export const updatePayment = (id: string, data: Partial<Payment>) =>
  apiFetch<Payment>(`/api/payments/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// ─── M-Pesa ───────────────────────────────────────────────────────────────────
export interface StkPushResult {
  paymentId: string; checkoutRequestId: string; customerMessage: string;
}
export const initiateStkPush = (data: {
  phone: string; amount: number; eventId: string; eventTitle?: string; paymentId?: string;
}) => apiFetch<StkPushResult>('/api/mpesa/stkpush', { method: 'POST', body: JSON.stringify(data) });

// ─── Sermons ─────────────────────────────────────────────────────────────────
export interface Sermon {
  id: string; title: string; speaker: string; date: string;
  duration?: string; type: string; description?: string; url?: string;
}
export const getSermons = (params?: { type?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<Sermon[]>(`/api/sermons${q ? `?${q}` : ''}`);
};
export const createSermon = (data: Partial<Sermon>) =>
  apiFetch<Sermon>('/api/sermons', { method: 'POST', body: JSON.stringify(data) });
export const updateSermon = (id: string, data: Partial<Sermon>) =>
  apiFetch<Sermon>(`/api/sermons/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSermon = (id: string) =>
  apiFetch(`/api/sermons/${id}`, { method: 'DELETE' });

// ─── Gallery ─────────────────────────────────────────────────────────────────
export interface GalleryItem {
  id: string; title: string; date: string; type: string; url: string; event?: string;
}
export const getGallery = (params?: { type?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<GalleryItem[]>(`/api/gallery${q ? `?${q}` : ''}`);
};
export const createGalleryItem = (data: Partial<GalleryItem>) =>
  apiFetch<GalleryItem>('/api/gallery', { method: 'POST', body: JSON.stringify(data) });
export const deleteGalleryItem = (id: string) =>
  apiFetch(`/api/gallery/${id}`, { method: 'DELETE' });

// ─── Newsletters ──────────────────────────────────────────────────────────────
export interface Newsletter {
  id: string; title: string; content?: string; date: string;
  author: string; status: string; category: string;
}
export const getNewsletters = (params?: { status?: string; category?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<Newsletter[]>(`/api/newsletters${q ? `?${q}` : ''}`);
};
export const createNewsletter = (data: Partial<Newsletter>) =>
  apiFetch<Newsletter>('/api/newsletters', { method: 'POST', body: JSON.stringify(data) });
export const updateNewsletter = (id: string, data: Partial<Newsletter>) =>
  apiFetch<Newsletter>(`/api/newsletters/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteNewsletter = (id: string) =>
  apiFetch(`/api/newsletters/${id}`, { method: 'DELETE' });

// ─── Expenses ─────────────────────────────────────────────────────────────────
export interface Expense {
  id: string; category: string; description: string; amount: string;
  date: string; approvedBy?: string; status: string; receiptNo?: string;
}
export const getExpenses = (params?: { status?: string; category?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<Expense[]>(`/api/expenses${q ? `?${q}` : ''}`);
};
export const createExpense = (data: Partial<Expense>) =>
  apiFetch<Expense>('/api/expenses', { method: 'POST', body: JSON.stringify(data) });
export const updateExpense = (id: string, data: Partial<Expense>) =>
  apiFetch<Expense>(`/api/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteExpense = (id: string) =>
  apiFetch(`/api/expenses/${id}`, { method: 'DELETE' });

// ─── Budget ───────────────────────────────────────────────────────────────────
export interface BudgetItem {
  id: string; category: string; allocated: string; spent: string; period: string;
}
export const getBudget = (params?: { period?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<BudgetItem[]>(`/api/budget${q ? `?${q}` : ''}`);
};
export const createBudgetItem = (data: Partial<BudgetItem>) =>
  apiFetch<BudgetItem>('/api/budget', { method: 'POST', body: JSON.stringify(data) });
export const updateBudgetItem = (id: string, data: Partial<BudgetItem>) =>
  apiFetch<BudgetItem>(`/api/budget/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// ─── Offerings ────────────────────────────────────────────────────────────────
export interface Offering {
  id: string; date: string; type: string; amount: string; service?: string; recordedBy: string;
}
export const getOfferings = (params?: { type?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<Offering[]>(`/api/offerings${q ? `?${q}` : ''}`);
};
export const createOffering = (data: Partial<Offering>) =>
  apiFetch<Offering>('/api/offerings', { method: 'POST', body: JSON.stringify(data) });

// ─── Records ─────────────────────────────────────────────────────────────────
export interface MeetingNote {
  id: string; title: string; date: string; author: string; content?: string; type: string;
}
export const getRecords = (params?: { type?: string }) => {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<MeetingNote[]>(`/api/records${q ? `?${q}` : ''}`);
};
export const createRecord = (data: Partial<MeetingNote>) =>
  apiFetch<MeetingNote>('/api/records', { method: 'POST', body: JSON.stringify(data) });
export const updateRecord = (id: string, data: Partial<MeetingNote>) =>
  apiFetch<MeetingNote>(`/api/records/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteRecord = (id: string) =>
  apiFetch(`/api/records/${id}`, { method: 'DELETE' });

// ─── Finance ─────────────────────────────────────────────────────────────────
export interface FinancialSummary {
  month: string; income: number; expenses: number; balance: number;
}
export interface FinanceStats {
  memberCount: number; upcomingEvents: number; totalRevenue: number;
  avgAttendanceRate: number; publishedNewsletters: number;
  budgetUtilization: number; totalAllocated: number; totalSpent: number;
}
export const getFinanceSummary = () => apiFetch<FinancialSummary[]>('/api/finance/summary');
export const getFinanceReports = () => apiFetch<{
  offeringsByType: { type: string; total: number }[];
  expensesByCategory: { category: string; total: number; status: string }[];
  paymentStats: { confirmedTotal: number; pendingTotal: number };
  memberCount: number;
}>('/api/finance/reports');
export const getFinanceStats = () => apiFetch<FinanceStats>('/api/finance/stats');
