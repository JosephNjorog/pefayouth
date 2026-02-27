export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  approvedBy: string;
  status: 'approved' | 'pending' | 'rejected';
  receiptNo?: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  period: string;
}

export interface FinancialSummary {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface Newsletter {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  status: 'published' | 'draft';
  category: 'announcement' | 'devotional' | 'update' | 'prayer';
}

export interface Offering {
  id: string;
  date: string;
  type: 'tithe' | 'offering' | 'special' | 'missions';
  amount: number;
  service: string;
  recordedBy: string;
}

export const expenses: Expense[] = [
  { id: 'exp1', category: 'Venue & Rent', description: 'Youth Hall monthly rent - January', amount: 25000, date: '2026-01-05', approvedBy: 'Pastor Daniel', status: 'approved', receiptNo: 'RCP-001' },
  { id: 'exp2', category: 'Sound & Equipment', description: 'New microphone set for worship', amount: 15000, date: '2026-01-12', approvedBy: 'Pastor Daniel', status: 'approved', receiptNo: 'RCP-002' },
  { id: 'exp3', category: 'Transport', description: 'Bus hire for outreach program', amount: 8000, date: '2026-01-18', approvedBy: 'Pastor Daniel', status: 'approved', receiptNo: 'RCP-003' },
  { id: 'exp4', category: 'Food & Refreshments', description: 'Snacks for Friday fellowship', amount: 3500, date: '2026-01-24', approvedBy: 'Mary Wambui', status: 'approved', receiptNo: 'RCP-004' },
  { id: 'exp5', category: 'Printing & Stationery', description: 'Event flyers and registration forms', amount: 2200, date: '2026-01-28', approvedBy: 'Mary Wambui', status: 'approved', receiptNo: 'RCP-005' },
  { id: 'exp6', category: 'Venue & Rent', description: 'Youth Hall monthly rent - February', amount: 25000, date: '2026-02-01', approvedBy: 'Pastor Daniel', status: 'approved', receiptNo: 'RCP-006' },
  { id: 'exp7', category: 'Leadership Development', description: 'Books for leadership seminar', amount: 4500, date: '2026-02-03', approvedBy: 'Pastor Daniel', status: 'pending' },
  { id: 'exp8', category: 'Transport', description: 'Retreat venue inspection trip', amount: 3000, date: '2026-02-04', approvedBy: 'Mary Wambui', status: 'pending' },
  { id: 'exp9', category: 'Charity & Outreach', description: 'Food packs for Kibera outreach', amount: 50000, date: '2026-02-05', approvedBy: 'Pastor Daniel', status: 'pending' },
  { id: 'exp10', category: 'Utilities', description: 'Electricity and water bill - January', amount: 4500, date: '2026-01-30', approvedBy: 'Mary Wambui', status: 'approved', receiptNo: 'RCP-007' },
];

export const budgetItems: BudgetItem[] = [
  { id: 'b1', category: 'Venue & Rent', allocated: 75000, spent: 50000, period: 'Q1 2026' },
  { id: 'b2', category: 'Sound & Equipment', allocated: 30000, spent: 15000, period: 'Q1 2026' },
  { id: 'b3', category: 'Transport', allocated: 25000, spent: 11000, period: 'Q1 2026' },
  { id: 'b4', category: 'Food & Refreshments', allocated: 15000, spent: 3500, period: 'Q1 2026' },
  { id: 'b5', category: 'Printing & Stationery', allocated: 10000, spent: 2200, period: 'Q1 2026' },
  { id: 'b6', category: 'Leadership Development', allocated: 20000, spent: 4500, period: 'Q1 2026' },
  { id: 'b7', category: 'Charity & Outreach', allocated: 100000, spent: 50000, period: 'Q1 2026' },
  { id: 'b8', category: 'Utilities', allocated: 15000, spent: 4500, period: 'Q1 2026' },
  { id: 'b9', category: 'Easter Camp', allocated: 450000, spent: 0, period: 'Q1 2026' },
  { id: 'b10', category: 'Miscellaneous', allocated: 20000, spent: 5000, period: 'Q1 2026' },
];

export const financialSummary: FinancialSummary[] = [
  { month: 'Oct 2025', income: 145000, expenses: 98000, balance: 47000 },
  { month: 'Nov 2025', income: 162000, expenses: 110000, balance: 52000 },
  { month: 'Dec 2025', income: 215000, expenses: 145000, balance: 70000 },
  { month: 'Jan 2026', income: 178000, expenses: 87700, balance: 90300 },
  { month: 'Feb 2026', income: 95000, expenses: 78000, balance: 17000 },
];

export const offerings: Offering[] = [
  { id: 'of1', date: '2026-02-02', type: 'tithe', amount: 45000, service: 'Sunday Service', recordedBy: 'Mary Wambui' },
  { id: 'of2', date: '2026-02-02', type: 'offering', amount: 28000, service: 'Sunday Service', recordedBy: 'Mary Wambui' },
  { id: 'of3', date: '2026-02-02', type: 'missions', amount: 12000, service: 'Sunday Service', recordedBy: 'Mary Wambui' },
  { id: 'of4', date: '2026-01-26', type: 'tithe', amount: 42000, service: 'Sunday Service', recordedBy: 'Mary Wambui' },
  { id: 'of5', date: '2026-01-26', type: 'offering', amount: 25000, service: 'Sunday Service', recordedBy: 'Mary Wambui' },
  { id: 'of6', date: '2026-01-26', type: 'special', amount: 35000, service: 'Special Offering - Building Fund', recordedBy: 'Mary Wambui' },
  { id: 'of7', date: '2026-01-19', type: 'tithe', amount: 38000, service: 'Sunday Service', recordedBy: 'Mary Wambui' },
  { id: 'of8', date: '2026-01-19', type: 'offering', amount: 22000, service: 'Sunday Service', recordedBy: 'Mary Wambui' },
  { id: 'of9', date: '2026-01-12', type: 'tithe', amount: 41000, service: 'Sunday Service', recordedBy: 'Mary Wambui' },
  { id: 'of10', date: '2026-01-12', type: 'offering', amount: 30000, service: 'Sunday Service', recordedBy: 'Mary Wambui' },
];

export const newsletters: Newsletter[] = [
  { id: 'nl1', title: 'February Youth Newsletter', content: 'Welcome to February! This month we have exciting events lined up including the Leadership Seminar on Feb 21st and the Community Outreach on Feb 22nd. Stay connected and keep growing in faith!', date: '2026-02-01', author: 'Ruth Njeri', status: 'published', category: 'update' },
  { id: 'nl2', title: 'Easter Camp Registration Open!', content: 'Our annual Easter Youth Camp is happening April 3-6 at Brackenhurst Retreat Center. Early bird registration is KES 5,000. Register before March 15th to secure your spot!', date: '2026-02-03', author: 'Ruth Njeri', status: 'published', category: 'announcement' },
  { id: 'nl3', title: 'Morning Devotional - Walking in Purpose', content: '"For I know the plans I have for you," declares the Lord. Let us walk each day knowing that God has a beautiful plan for our lives. Take time today to pray and seek His guidance.', date: '2026-02-04', author: 'Pastor Daniel', status: 'published', category: 'devotional' },
  { id: 'nl4', title: 'Prayer Points for the Week', content: '1. Pray for upcoming Leadership Seminar\n2. Pray for youth struggling with studies\n3. Pray for our outreach in Kibera\n4. Pray for new members integration\n5. Pray for the worship team', date: '2026-02-05', author: 'Ruth Njeri', status: 'published', category: 'prayer' },
  { id: 'nl5', title: 'March Events Preview', content: 'Coming up in March: Youth Retreat at Lake Naivasha (March 14-16), Monthly Prayer Night, and special guest speaker Bishop Wainaina.', date: '2026-02-06', author: 'Ruth Njeri', status: 'draft', category: 'update' },
];

export const expenseCategories = [
  'Venue & Rent', 'Sound & Equipment', 'Transport', 'Food & Refreshments',
  'Printing & Stationery', 'Leadership Development', 'Charity & Outreach',
  'Utilities', 'Easter Camp', 'Miscellaneous'
];
