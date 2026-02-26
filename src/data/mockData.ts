export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  ministry: string;
  cellGroup: string;
  avatar: string;
  joinedDate: string;
  attendanceRate: number;
}

export interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'service' | 'seminar' | 'retreat' | 'camp' | 'fellowship' | 'outreach';
  isPaid: boolean;
  price?: number;
  capacity: number;
  registered: number;
  image?: string;
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  date: string;
  present: number;
  absent: number;
  total: number;
}

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  eventId: string;
  eventTitle: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  date: string;
  phone: string;
  transactionId?: string;
}

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  duration: string;
  type: 'audio' | 'video';
  thumbnail: string;
  description: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  date: string;
  type: 'photo' | 'video';
  url: string;
  event: string;
}

export interface MeetingNote {
  id: string;
  title: string;
  date: string;
  author: string;
  content: string;
  type: 'meeting' | 'event-note';
}

export const currentMember: Member = {
  id: 'm1',
  name: 'Grace Wanjiku',
  phone: '+254 712 345 678',
  email: 'grace@email.com',
  ministry: 'Worship Team',
  cellGroup: 'Faith Cell',
  avatar: '',
  joinedDate: '2024-03-15',
  attendanceRate: 87,
};

export const members: Member[] = [
  currentMember,
  { id: 'm2', name: 'James Ochieng', phone: '+254 723 456 789', email: 'james@email.com', ministry: 'Ushering', cellGroup: 'Hope Cell', avatar: '', joinedDate: '2023-08-20', attendanceRate: 92 },
  { id: 'm3', name: 'Mercy Akinyi', phone: '+254 734 567 890', email: 'mercy@email.com', ministry: 'Media Team', cellGroup: 'Faith Cell', avatar: '', joinedDate: '2024-01-10', attendanceRate: 78 },
  { id: 'm4', name: 'David Kamau', phone: '+254 745 678 901', email: 'david@email.com', ministry: 'Worship Team', cellGroup: 'Grace Cell', avatar: '', joinedDate: '2023-06-05', attendanceRate: 95 },
  { id: 'm5', name: 'Esther Njeri', phone: '+254 756 789 012', email: 'esther@email.com', ministry: 'Hospitality', cellGroup: 'Hope Cell', avatar: '', joinedDate: '2024-05-22', attendanceRate: 68 },
  { id: 'm6', name: 'Peter Mwangi', phone: '+254 767 890 123', email: 'peter@email.com', ministry: 'Ushering', cellGroup: 'Grace Cell', avatar: '', joinedDate: '2023-11-01', attendanceRate: 82 },
  { id: 'm7', name: 'Faith Chebet', phone: '+254 778 901 234', email: 'faith@email.com', ministry: 'Choir', cellGroup: 'Faith Cell', avatar: '', joinedDate: '2024-07-14', attendanceRate: 90 },
  { id: 'm8', name: 'Samuel Kiprop', phone: '+254 789 012 345', email: 'samuel@email.com', ministry: 'Media Team', cellGroup: 'Hope Cell', avatar: '', joinedDate: '2024-02-28', attendanceRate: 74 },
];

export const events: ChurchEvent[] = [
  { id: 'e1', title: 'Sunday Worship Service', description: 'Join us for a powerful time of worship and the Word. Come expectant!', date: '2026-02-08', time: '09:00 AM', location: 'Main Sanctuary', type: 'service', isPaid: false, capacity: 200, registered: 145 },
  { id: 'e2', title: 'Youth Fellowship Friday', description: 'A time of fellowship, games, and sharing testimonies together.', date: '2026-02-13', time: '06:00 PM', location: 'Youth Hall', type: 'fellowship', isPaid: false, capacity: 80, registered: 52 },
  { id: 'e3', title: 'Leadership Seminar', description: 'Growing as leaders in the Kingdom. Speaker: Pastor John Maina.', date: '2026-02-21', time: '10:00 AM', location: 'Conference Room', type: 'seminar', isPaid: true, price: 500, capacity: 50, registered: 32 },
  { id: 'e4', title: 'Youth Retreat - Mountain of Fire', description: 'A 3-day spiritual retreat at Naivasha. Accommodation and meals included.', date: '2026-03-14', time: '08:00 AM', location: 'Lake Naivasha Resort', type: 'retreat', isPaid: true, price: 3500, capacity: 60, registered: 38 },
  { id: 'e5', title: 'Community Outreach', description: 'Serving our community through food distribution and prayer.', date: '2026-02-22', time: '08:00 AM', location: 'Kibera Community Center', type: 'outreach', isPaid: false, capacity: 40, registered: 28 },
  { id: 'e6', title: 'Worship Night', description: 'An evening of deep worship and intercession. Come as you are.', date: '2026-02-15', time: '07:00 PM', location: 'Main Sanctuary', type: 'service', isPaid: false, capacity: 200, registered: 120 },
  { id: 'e7', title: 'Easter Youth Camp', description: 'Annual Easter camp with activities, teachings, and bonfire nights.', date: '2026-04-03', time: '07:00 AM', location: 'Brackenhurst Retreat Center', type: 'camp', isPaid: true, price: 5000, capacity: 100, registered: 67 },
  { id: 'e8', title: 'Bible Study - Book of Romans', description: 'Deep dive into the book of Romans. Bring your Bible and notebook.', date: '2026-02-11', time: '06:30 PM', location: 'Youth Hall', type: 'fellowship', isPaid: false, capacity: 60, registered: 34 },
];

export const attendanceRecords: AttendanceRecord[] = [
  { id: 'a1', eventId: 'e1', eventTitle: 'Sunday Service - Jan 5', date: '2026-01-05', present: 132, absent: 18, total: 150 },
  { id: 'a2', eventId: 'e1', eventTitle: 'Sunday Service - Jan 12', date: '2026-01-12', present: 141, absent: 9, total: 150 },
  { id: 'a3', eventId: 'e1', eventTitle: 'Sunday Service - Jan 19', date: '2026-01-19', present: 128, absent: 22, total: 150 },
  { id: 'a4', eventId: 'e1', eventTitle: 'Sunday Service - Jan 26', date: '2026-01-26', present: 138, absent: 12, total: 150 },
  { id: 'a5', eventId: 'e2', eventTitle: 'Youth Fellowship - Jan 10', date: '2026-01-10', present: 45, absent: 7, total: 52 },
  { id: 'a6', eventId: 'e2', eventTitle: 'Youth Fellowship - Jan 24', date: '2026-01-24', present: 48, absent: 4, total: 52 },
  { id: 'a7', eventId: 'e1', eventTitle: 'Sunday Service - Feb 2', date: '2026-02-02', present: 145, absent: 5, total: 150 },
];

export const payments: Payment[] = [
  { id: 'p1', memberId: 'm1', memberName: 'Grace Wanjiku', eventId: 'e3', eventTitle: 'Leadership Seminar', amount: 500, status: 'confirmed', date: '2026-02-01', phone: '+254 712 345 678', transactionId: 'TXN001234' },
  { id: 'p2', memberId: 'm2', memberName: 'James Ochieng', eventId: 'e4', eventTitle: 'Youth Retreat', amount: 3500, status: 'confirmed', date: '2026-02-03', phone: '+254 723 456 789', transactionId: 'TXN001235' },
  { id: 'p3', memberId: 'm3', memberName: 'Mercy Akinyi', eventId: 'e3', eventTitle: 'Leadership Seminar', amount: 500, status: 'pending', date: '2026-02-04', phone: '+254 734 567 890' },
  { id: 'p4', memberId: 'm4', memberName: 'David Kamau', eventId: 'e4', eventTitle: 'Youth Retreat', amount: 3500, status: 'confirmed', date: '2026-02-02', phone: '+254 745 678 901', transactionId: 'TXN001236' },
  { id: 'p5', memberId: 'm5', memberName: 'Esther Njeri', eventId: 'e7', eventTitle: 'Easter Youth Camp', amount: 5000, status: 'pending', date: '2026-02-05', phone: '+254 756 789 012' },
  { id: 'p6', memberId: 'm6', memberName: 'Peter Mwangi', eventId: 'e3', eventTitle: 'Leadership Seminar', amount: 500, status: 'failed', date: '2026-02-04', phone: '+254 767 890 123' },
  { id: 'p7', memberId: 'm7', memberName: 'Faith Chebet', eventId: 'e4', eventTitle: 'Youth Retreat', amount: 3500, status: 'confirmed', date: '2026-02-01', phone: '+254 778 901 234', transactionId: 'TXN001237' },
];

export const sermons: Sermon[] = [
  { id: 's1', title: 'Walking in Purpose', speaker: 'Pastor James Karanja', date: '2026-02-02', duration: '45 min', type: 'video', thumbnail: '', description: 'Discover God\'s unique purpose for your life and how to walk in it daily.' },
  { id: 's2', title: 'The Power of Prayer', speaker: 'Rev. Mary Wambui', date: '2026-01-26', duration: '38 min', type: 'audio', thumbnail: '', description: 'Understanding the transformative power of consistent prayer life.' },
  { id: 's3', title: 'Faith Over Fear', speaker: 'Pastor James Karanja', date: '2026-01-19', duration: '42 min', type: 'video', thumbnail: '', description: 'How to overcome fear through faith and trust in God.' },
  { id: 's4', title: 'Youth on Fire', speaker: 'Bishop Daniel Mutua', date: '2026-01-12', duration: '50 min', type: 'video', thumbnail: '', description: 'A call for the youth to rise up and be the light of the world.' },
  { id: 's5', title: 'Grace Sufficient', speaker: 'Rev. Mary Wambui', date: '2026-01-05', duration: '35 min', type: 'audio', thumbnail: '', description: 'Understanding the sufficiency of God\'s grace in every season.' },
];

export const galleryItems: GalleryItem[] = [
  { id: 'g1', title: 'Sunday Worship', date: '2026-02-02', type: 'photo', url: '', event: 'Sunday Service' },
  { id: 'g2', title: 'Youth Fellowship', date: '2026-01-24', type: 'photo', url: '', event: 'Fellowship Friday' },
  { id: 'g3', title: 'Outreach Day', date: '2026-01-18', type: 'photo', url: '', event: 'Community Outreach' },
  { id: 'g4', title: 'Worship Night Highlights', date: '2026-01-15', type: 'video', url: '', event: 'Worship Night' },
  { id: 'g5', title: 'Christmas Celebration', date: '2025-12-25', type: 'photo', url: '', event: 'Christmas Service' },
  { id: 'g6', title: 'New Year Service', date: '2026-01-01', type: 'photo', url: '', event: 'New Year Watch Night' },
];

export const meetingNotes: MeetingNote[] = [
  { id: 'n1', title: 'Youth Committee Meeting', date: '2026-02-01', author: 'Admin', content: 'Discussed Easter camp planning. Budget approved at KES 450,000. Venue booked at Brackenhurst. Team leaders assigned for activities, worship, and logistics.', type: 'meeting' },
  { id: 'n2', title: 'Worship Team Planning', date: '2026-01-28', author: 'Admin', content: 'Reviewed setlist for February. New songs to be introduced: "Build My Life" and "Goodness of God". Sound check schedule updated.', type: 'meeting' },
  { id: 'n3', title: 'Leadership Seminar Debrief', date: '2026-01-25', author: 'Admin', content: 'Seminar was well received. 32 attendees. Feedback collected. Next seminar planned for March on "Servant Leadership".', type: 'event-note' },
  { id: 'n4', title: 'Outreach Planning', date: '2026-01-20', author: 'Admin', content: 'Kibera outreach planned for Feb 22. Food packs budget: KES 50,000. Volunteers needed: 40. Transport arranged.', type: 'meeting' },
];

export const memberAttendanceHistory = [
  { date: '2026-02-02', event: 'Sunday Service', status: 'present' as const },
  { date: '2026-01-26', event: 'Sunday Service', status: 'present' as const },
  { date: '2026-01-24', event: 'Youth Fellowship', status: 'present' as const },
  { date: '2026-01-19', event: 'Sunday Service', status: 'absent' as const },
  { date: '2026-01-12', event: 'Sunday Service', status: 'present' as const },
  { date: '2026-01-10', event: 'Youth Fellowship', status: 'present' as const },
  { date: '2026-01-05', event: 'Sunday Service', status: 'present' as const },
  { date: '2025-12-29', event: 'Sunday Service', status: 'present' as const },
  { date: '2025-12-25', event: 'Christmas Service', status: 'present' as const },
];
