import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import bcrypt from 'bcryptjs';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required. Copy .env.example to .env and fill in your Neon URL.');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('🌱 Seeding database...');

  // ─── Members ────────────────────────────────────────────────────────────────
  const memberRows = await db.insert(schema.members).values([
    { name: 'Grace Wanjiku', phone: '+254 712 345 678', email: 'grace@pefayouth.org', ministry: 'Worship Team', cellGroup: 'Faith Cell', joinedDate: '2024-03-15', attendanceRate: '87' },
    { name: 'James Ochieng', phone: '+254 723 456 789', email: 'james@pefayouth.org', ministry: 'Ushering', cellGroup: 'Hope Cell', joinedDate: '2023-08-20', attendanceRate: '92' },
    { name: 'Mercy Akinyi', phone: '+254 734 567 890', email: 'mercy@pefayouth.org', ministry: 'Media Team', cellGroup: 'Faith Cell', joinedDate: '2024-01-10', attendanceRate: '78' },
    { name: 'David Kamau', phone: '+254 745 678 901', email: 'david@pefayouth.org', ministry: 'Worship Team', cellGroup: 'Grace Cell', joinedDate: '2023-06-05', attendanceRate: '95' },
    { name: 'Esther Njeri', phone: '+254 756 789 012', email: 'esther@pefayouth.org', ministry: 'Hospitality', cellGroup: 'Hope Cell', joinedDate: '2024-05-22', attendanceRate: '68' },
    { name: 'Peter Mwangi', phone: '+254 767 890 123', email: 'peter@pefayouth.org', ministry: 'Ushering', cellGroup: 'Grace Cell', joinedDate: '2023-11-01', attendanceRate: '82' },
    { name: 'Faith Chebet', phone: '+254 778 901 234', email: 'faith@pefayouth.org', ministry: 'Choir', cellGroup: 'Faith Cell', joinedDate: '2024-07-14', attendanceRate: '90' },
    { name: 'Samuel Kiprop', phone: '+254 789 012 345', email: 'samuel@pefayouth.org', ministry: 'Media Team', cellGroup: 'Hope Cell', joinedDate: '2024-02-28', attendanceRate: '74' },
    { name: 'Pastor Daniel Mutua', phone: '+254 700 111 000', email: 'admin@pefayouth.org', ministry: 'Leadership', cellGroup: 'Grace Cell', joinedDate: '2015-01-01', attendanceRate: '100' },
    { name: 'Mary Wambui', phone: '+254 700 222 000', email: 'finance@pefayouth.org', ministry: 'Finance', cellGroup: 'Hope Cell', joinedDate: '2016-06-01', attendanceRate: '98' },
    { name: 'Ruth Njeri', phone: '+254 700 333 000', email: 'secretary@pefayouth.org', ministry: 'Administration', cellGroup: 'Faith Cell', joinedDate: '2017-03-01', attendanceRate: '96' },
  ]).returning();

  const grace = memberRows[0];
  const daniel = memberRows[8];
  const mary = memberRows[9];
  const ruth = memberRows[10];

  console.log('✅ Members seeded:', memberRows.length);

  // ─── Users (auth) ───────────────────────────────────────────────────────────
  const hash = (pw: string) => bcrypt.hashSync(pw, 10);
  await db.insert(schema.users).values([
    { email: 'grace@pefayouth.org', passwordHash: hash('member123'), role: 'member', memberId: grace.id },
    { email: 'admin@pefayouth.org', passwordHash: hash('admin123'), role: 'super_admin', memberId: daniel.id },
    { email: 'finance@pefayouth.org', passwordHash: hash('finance123'), role: 'finance_admin', memberId: mary.id },
    { email: 'secretary@pefayouth.org', passwordHash: hash('secretary123'), role: 'secretary', memberId: ruth.id },
  ]);
  console.log('✅ Users seeded (4 accounts)');

  // ─── Events ─────────────────────────────────────────────────────────────────
  await db.insert(schema.events).values([
    { title: 'Sunday Worship Service', description: 'Join us for a powerful time of worship and the Word. Come expectant!', date: '2026-02-08', time: '09:00 AM', location: 'Main Sanctuary', type: 'service', isPaid: false, capacity: 200, registered: 145 },
    { title: 'Youth Fellowship Friday', description: 'A time of fellowship, games, and sharing testimonies together.', date: '2026-02-13', time: '06:00 PM', location: 'Youth Hall', type: 'fellowship', isPaid: false, capacity: 80, registered: 52 },
    { title: 'Leadership Seminar', description: 'Growing as leaders in the Kingdom. Speaker: Pastor John Maina.', date: '2026-02-21', time: '10:00 AM', location: 'Conference Room', type: 'seminar', isPaid: true, price: '500', capacity: 50, registered: 32 },
    { title: 'Youth Retreat - Mountain of Fire', description: 'A 3-day spiritual retreat at Naivasha. Accommodation and meals included.', date: '2026-03-14', time: '08:00 AM', location: 'Lake Naivasha Resort', type: 'retreat', isPaid: true, price: '3500', capacity: 60, registered: 38 },
    { title: 'Community Outreach', description: 'Serving our community through food distribution and prayer.', date: '2026-02-22', time: '08:00 AM', location: 'Kibera Community Center', type: 'outreach', isPaid: false, capacity: 40, registered: 28 },
    { title: 'Worship Night', description: 'An evening of deep worship and intercession. Come as you are.', date: '2026-02-15', time: '07:00 PM', location: 'Main Sanctuary', type: 'service', isPaid: false, capacity: 200, registered: 120 },
    { title: 'Easter Youth Camp', description: 'Annual Easter camp with activities, teachings, and bonfire nights.', date: '2026-04-03', time: '07:00 AM', location: 'Brackenhurst Retreat Center', type: 'camp', isPaid: true, price: '5000', capacity: 100, registered: 67 },
    { title: 'Bible Study - Book of Romans', description: 'Deep dive into the book of Romans. Bring your Bible and notebook.', date: '2026-02-11', time: '06:30 PM', location: 'Youth Hall', type: 'fellowship', isPaid: false, capacity: 60, registered: 34 },
  ]);
  console.log('✅ Events seeded');

  // ─── Sermons ────────────────────────────────────────────────────────────────
  await db.insert(schema.sermons).values([
    { title: 'Walking in Purpose', speaker: 'Pastor James Karanja', date: '2026-02-02', duration: '45 min', type: 'video', description: "Discover God's unique purpose for your life and how to walk in it daily." },
    { title: 'The Power of Prayer', speaker: 'Rev. Mary Wambui', date: '2026-01-26', duration: '38 min', type: 'audio', description: 'Understanding the transformative power of consistent prayer life.' },
    { title: 'Faith Over Fear', speaker: 'Pastor James Karanja', date: '2026-01-19', duration: '42 min', type: 'video', description: 'How to overcome fear through faith and trust in God.' },
    { title: 'Youth on Fire', speaker: 'Bishop Daniel Mutua', date: '2026-01-12', duration: '50 min', type: 'video', description: 'A call for the youth to rise up and be the light of the world.' },
    { title: 'Grace Sufficient', speaker: 'Rev. Mary Wambui', date: '2026-01-05', duration: '35 min', type: 'audio', description: "Understanding the sufficiency of God's grace in every season." },
  ]);
  console.log('✅ Sermons seeded');

  // ─── Gallery ────────────────────────────────────────────────────────────────
  await db.insert(schema.galleryItems).values([
    { title: 'Sunday Worship', date: '2026-02-02', type: 'photo', url: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800', event: 'Sunday Service' },
    { title: 'Youth Fellowship', date: '2026-01-24', type: 'photo', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800', event: 'Fellowship Friday' },
    { title: 'Outreach Day', date: '2026-01-18', type: 'photo', url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800', event: 'Community Outreach' },
    { title: 'Worship Night Highlights', date: '2026-01-15', type: 'video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', event: 'Worship Night' },
    { title: 'Christmas Celebration', date: '2025-12-25', type: 'photo', url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800', event: 'Christmas Service' },
    { title: 'New Year Service', date: '2026-01-01', type: 'photo', url: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800', event: 'New Year Watch Night' },
  ]);
  console.log('✅ Gallery seeded');

  // ─── Newsletters ────────────────────────────────────────────────────────────
  await db.insert(schema.newsletters).values([
    { title: 'February Youth Newsletter', content: 'Welcome to February! This month we have exciting events lined up including the Leadership Seminar on Feb 21st and the Community Outreach on Feb 22nd. Stay connected and keep growing in faith!', date: '2026-02-01', author: 'Ruth Njeri', status: 'published', category: 'update' },
    { title: 'Easter Camp Registration Open!', content: 'Our annual Easter Youth Camp is happening April 3-6 at Brackenhurst Retreat Center. Early bird registration is KES 5,000. Register before March 15th to secure your spot!', date: '2026-02-03', author: 'Ruth Njeri', status: 'published', category: 'announcement' },
    { title: 'Morning Devotional - Walking in Purpose', content: '"For I know the plans I have for you," declares the Lord. Let us walk each day knowing that God has a beautiful plan for our lives. Take time today to pray and seek His guidance.', date: '2026-02-04', author: 'Pastor Daniel', status: 'published', category: 'devotional' },
    { title: 'Prayer Points for the Week', content: '1. Pray for upcoming Leadership Seminar\n2. Pray for youth struggling with studies\n3. Pray for our outreach in Kibera\n4. Pray for new members integration\n5. Pray for the worship team', date: '2026-02-05', author: 'Ruth Njeri', status: 'published', category: 'prayer' },
    { title: 'March Events Preview', content: 'Coming up in March: Youth Retreat at Lake Naivasha (March 14-16), Monthly Prayer Night, and special guest speaker Bishop Wainaina.', date: '2026-02-06', author: 'Ruth Njeri', status: 'draft', category: 'update' },
  ]);
  console.log('✅ Newsletters seeded');

  // ─── Expenses ───────────────────────────────────────────────────────────────
  await db.insert(schema.expenses).values([
    { category: 'Venue & Rent', description: 'Youth Hall monthly rent - January', amount: '25000', date: '2026-01-05', approvedBy: 'Pastor Daniel', status: 'approved', receiptNo: 'RCP-001' },
    { category: 'Sound & Equipment', description: 'New microphone set for worship', amount: '15000', date: '2026-01-12', approvedBy: 'Pastor Daniel', status: 'approved', receiptNo: 'RCP-002' },
    { category: 'Transport', description: 'Bus hire for outreach program', amount: '8000', date: '2026-01-18', approvedBy: 'Pastor Daniel', status: 'approved', receiptNo: 'RCP-003' },
    { category: 'Food & Refreshments', description: 'Snacks for Friday fellowship', amount: '3500', date: '2026-01-24', approvedBy: 'Mary Wambui', status: 'approved', receiptNo: 'RCP-004' },
    { category: 'Printing & Stationery', description: 'Event flyers and registration forms', amount: '2200', date: '2026-01-28', approvedBy: 'Mary Wambui', status: 'approved', receiptNo: 'RCP-005' },
    { category: 'Venue & Rent', description: 'Youth Hall monthly rent - February', amount: '25000', date: '2026-02-01', approvedBy: 'Pastor Daniel', status: 'approved', receiptNo: 'RCP-006' },
    { category: 'Leadership Development', description: 'Books for leadership seminar', amount: '4500', date: '2026-02-03', approvedBy: 'Pastor Daniel', status: 'pending' },
    { category: 'Transport', description: 'Retreat venue inspection trip', amount: '3000', date: '2026-02-04', approvedBy: 'Mary Wambui', status: 'pending' },
    { category: 'Charity & Outreach', description: 'Food packs for Kibera outreach', amount: '50000', date: '2026-02-05', approvedBy: 'Pastor Daniel', status: 'pending' },
    { category: 'Utilities', description: 'Electricity and water bill - January', amount: '4500', date: '2026-01-30', approvedBy: 'Mary Wambui', status: 'approved', receiptNo: 'RCP-007' },
  ]);
  console.log('✅ Expenses seeded');

  // ─── Budget Items ───────────────────────────────────────────────────────────
  await db.insert(schema.budgetItems).values([
    { category: 'Venue & Rent', allocated: '75000', spent: '50000', period: 'Q1 2026' },
    { category: 'Sound & Equipment', allocated: '30000', spent: '15000', period: 'Q1 2026' },
    { category: 'Transport', allocated: '25000', spent: '11000', period: 'Q1 2026' },
    { category: 'Food & Refreshments', allocated: '15000', spent: '3500', period: 'Q1 2026' },
    { category: 'Printing & Stationery', allocated: '10000', spent: '2200', period: 'Q1 2026' },
    { category: 'Leadership Development', allocated: '20000', spent: '4500', period: 'Q1 2026' },
    { category: 'Charity & Outreach', allocated: '100000', spent: '50000', period: 'Q1 2026' },
    { category: 'Utilities', allocated: '15000', spent: '4500', period: 'Q1 2026' },
    { category: 'Easter Camp', allocated: '450000', spent: '0', period: 'Q1 2026' },
    { category: 'Miscellaneous', allocated: '20000', spent: '5000', period: 'Q1 2026' },
  ]);
  console.log('✅ Budget items seeded');

  // ─── Offerings ──────────────────────────────────────────────────────────────
  await db.insert(schema.offerings).values([
    { date: '2026-02-02', type: 'tithe', amount: '45000', service: 'Sunday Service', recordedBy: 'Mary Wambui' },
    { date: '2026-02-02', type: 'offering', amount: '28000', service: 'Sunday Service', recordedBy: 'Mary Wambui' },
    { date: '2026-02-02', type: 'missions', amount: '12000', service: 'Sunday Service', recordedBy: 'Mary Wambui' },
    { date: '2026-01-26', type: 'tithe', amount: '42000', service: 'Sunday Service', recordedBy: 'Mary Wambui' },
    { date: '2026-01-26', type: 'offering', amount: '25000', service: 'Sunday Service', recordedBy: 'Mary Wambui' },
    { date: '2026-01-26', type: 'special', amount: '35000', service: 'Special Offering - Building Fund', recordedBy: 'Mary Wambui' },
    { date: '2026-01-19', type: 'tithe', amount: '38000', service: 'Sunday Service', recordedBy: 'Mary Wambui' },
    { date: '2026-01-19', type: 'offering', amount: '22000', service: 'Sunday Service', recordedBy: 'Mary Wambui' },
    { date: '2026-01-12', type: 'tithe', amount: '41000', service: 'Sunday Service', recordedBy: 'Mary Wambui' },
    { date: '2026-01-12', type: 'offering', amount: '30000', service: 'Sunday Service', recordedBy: 'Mary Wambui' },
  ]);
  console.log('✅ Offerings seeded');

  // ─── Meeting Notes ──────────────────────────────────────────────────────────
  await db.insert(schema.meetingNotes).values([
    { title: 'Youth Committee Meeting', date: '2026-02-01', author: 'Admin', content: 'Discussed Easter camp planning. Budget approved at KES 450,000. Venue booked at Brackenhurst. Team leaders assigned for activities, worship, and logistics.', type: 'meeting' },
    { title: 'Worship Team Planning', date: '2026-01-28', author: 'Admin', content: 'Reviewed setlist for February. New songs to be introduced: "Build My Life" and "Goodness of God". Sound check schedule updated.', type: 'meeting' },
    { title: 'Leadership Seminar Debrief', date: '2026-01-25', author: 'Admin', content: 'Seminar was well received. 32 attendees. Feedback collected. Next seminar planned for March on "Servant Leadership".', type: 'event-note' },
    { title: 'Outreach Planning', date: '2026-01-20', author: 'Admin', content: 'Kibera outreach planned for Feb 22. Food packs budget: KES 50,000. Volunteers needed: 40. Transport arranged.', type: 'meeting' },
  ]);
  console.log('✅ Meeting notes seeded');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📧 Default login credentials:');
  console.log('  Member:         grace@pefayouth.org     / member123');
  console.log('  Super Admin:    admin@pefayouth.org     / admin123');
  console.log('  Finance Admin:  finance@pefayouth.org   / finance123');
  console.log('  Secretary:      secretary@pefayouth.org / secretary123');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
