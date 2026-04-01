import { getMongoDb } from '@/lib/mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    console.log('API HIT: /api/admin/dashboard/stats');

    const db = await getMongoDb();

    const [users, camps, bookings, memories] = await Promise.all([
      db.collection('users').countDocuments({}),
      db.collection(process.env.MONGODB_CAMPS_COLLECTION || 'camps').countDocuments({}),
      db.collection('bookings').countDocuments({}),
      db.collection('memories').countDocuments({}),
    ]);

    const data = {
      users,
      camps,
      bookings,
      memories,
      generatedAt: new Date().toISOString(),
    };

    return Response.json({ success: true, data });
  } catch (error) {
    console.error('ADMIN DASHBOARD STATS ERROR:', error);
    return Response.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
