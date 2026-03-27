import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';

// ─── Members ─────────────────────────────────────────────────────────────────
export const useMembers = (params?: { search?: string; ministry?: string; cellGroup?: string }) =>
  useQuery({ queryKey: ['members', params], queryFn: () => api.getMembers(params) });

export const useMember = (id?: string) =>
  useQuery({ queryKey: ['members', id], queryFn: () => api.getMember(id!), enabled: !!id });

export const useCreateMember = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.createMember, onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }) });
};
export const useUpdateMember = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<api.Member> }) => api.updateMember(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }) });
};
export const useDeleteMember = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.deleteMember, onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }) });
};

// ─── Events ───────────────────────────────────────────────────────────────────
export const useEvents = (params?: { type?: string; upcoming?: string }) =>
  useQuery({ queryKey: ['events', params], queryFn: () => api.getEvents(params) });

export const useEvent = (id?: string) =>
  useQuery({ queryKey: ['events', id], queryFn: () => api.getEvent(id!), enabled: !!id });

export const useCreateEvent = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.createEvent, onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }) });
};
export const useUpdateEvent = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<api.ChurchEvent> }) => api.updateEvent(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }) });
};
export const useDeleteEvent = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.deleteEvent, onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }) });
};
export const useRegisterForEvent = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.registerForEvent, onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }) });
};

// ─── Attendance ───────────────────────────────────────────────────────────────
export const useAttendance = (params?: { eventId?: string; memberId?: string }) =>
  useQuery({ queryKey: ['attendance', params], queryFn: () => api.getAttendance(params) });

export const useRecordAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, records }: { eventId: string; records: { memberId: string; present: boolean }[] }) =>
      api.recordAttendance(eventId, records),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const usePayments = (params?: { eventId?: string; status?: string }) =>
  useQuery({ queryKey: ['payments', params], queryFn: () => api.getPayments(params) });

export const usePayment = (id?: string) =>
  useQuery({ queryKey: ['payments', id], queryFn: () => api.getPayment(id!), enabled: !!id });

export const useCreatePayment = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.createPayment, onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }) });
};
export const useUpdatePayment = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<api.Payment> }) => api.updatePayment(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }) });
};

// ─── M-Pesa ───────────────────────────────────────────────────────────────────
export const useInitiateStkPush = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.initiateStkPush,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  });
};

// ─── Sermons ─────────────────────────────────────────────────────────────────
export const useSermons = (params?: { type?: string }) =>
  useQuery({ queryKey: ['sermons', params], queryFn: () => api.getSermons(params) });

export const useCreateSermon = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.createSermon, onSuccess: () => qc.invalidateQueries({ queryKey: ['sermons'] }) });
};
export const useUpdateSermon = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<api.Sermon> }) => api.updateSermon(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['sermons'] }) });
};
export const useDeleteSermon = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.deleteSermon, onSuccess: () => qc.invalidateQueries({ queryKey: ['sermons'] }) });
};

// ─── Gallery ─────────────────────────────────────────────────────────────────
export const useGallery = (params?: { type?: string }) =>
  useQuery({ queryKey: ['gallery', params], queryFn: () => api.getGallery(params) });

export const useCreateGalleryItem = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.createGalleryItem, onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery'] }) });
};
export const useDeleteGalleryItem = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.deleteGalleryItem, onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery'] }) });
};
export const useUpdateGalleryItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; event?: string } }) => api.updateGalleryItem(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gallery'] }),
  });
};

// ─── Newsletters ──────────────────────────────────────────────────────────────
export const useNewsletters = (params?: { status?: string; category?: string }) =>
  useQuery({ queryKey: ['newsletters', params], queryFn: () => api.getNewsletters(params) });

export const useCreateNewsletter = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.createNewsletter, onSuccess: () => qc.invalidateQueries({ queryKey: ['newsletters'] }) });
};
export const useUpdateNewsletter = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<api.Newsletter> }) => api.updateNewsletter(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['newsletters'] }) });
};
export const useDeleteNewsletter = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.deleteNewsletter, onSuccess: () => qc.invalidateQueries({ queryKey: ['newsletters'] }) });
};

// ─── Expenses ─────────────────────────────────────────────────────────────────
export const useExpenses = (params?: { status?: string; category?: string }) =>
  useQuery({ queryKey: ['expenses', params], queryFn: () => api.getExpenses(params) });

export const useCreateExpense = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.createExpense, onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }) });
};
export const useUpdateExpense = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<api.Expense> }) => api.updateExpense(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }) });
};
export const useDeleteExpense = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.deleteExpense, onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }) });
};

// ─── Budget ───────────────────────────────────────────────────────────────────
export const useBudget = (params?: { period?: string }) =>
  useQuery({ queryKey: ['budget', params], queryFn: () => api.getBudget(params) });

export const useCreateBudgetItem = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.createBudgetItem, onSuccess: () => qc.invalidateQueries({ queryKey: ['budget'] }) });
};
export const useUpdateBudgetItem = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<api.BudgetItem> }) => api.updateBudgetItem(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['budget'] }) });
};

// ─── Offerings ────────────────────────────────────────────────────────────────
export const useOfferings = (params?: { type?: string }) =>
  useQuery({ queryKey: ['offerings', params], queryFn: () => api.getOfferings(params) });

export const useCreateOffering = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.createOffering, onSuccess: () => qc.invalidateQueries({ queryKey: ['offerings'] }) });
};

// ─── Records ─────────────────────────────────────────────────────────────────
export const useRecords = (params?: { type?: string }) =>
  useQuery({ queryKey: ['records', params], queryFn: () => api.getRecords(params) });

export const useCreateRecord = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.createRecord, onSuccess: () => qc.invalidateQueries({ queryKey: ['records'] }) });
};
export const useUpdateRecord = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<api.MeetingNote> }) => api.updateRecord(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['records'] }) });
};
export const useDeleteRecord = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.deleteRecord, onSuccess: () => qc.invalidateQueries({ queryKey: ['records'] }) });
};

// ─── Finance ─────────────────────────────────────────────────────────────────
export const useFinanceSummary = () =>
  useQuery({ queryKey: ['finance', 'summary'], queryFn: api.getFinanceSummary });

export const useFinanceReports = () =>
  useQuery({ queryKey: ['finance', 'reports'], queryFn: api.getFinanceReports });

export const useFinanceStats = () =>
  useQuery({ queryKey: ['finance', 'stats'], queryFn: api.getFinanceStats });

// ─── Notifications ─────────────────────────────────────────────────────────
export const useNotifications = () =>
  useQuery({
    queryKey: ['notifications'],
    queryFn: api.getNotifications,
    refetchInterval: 60_000, // poll every 60s for new notifications
    staleTime: 30_000,
  });
