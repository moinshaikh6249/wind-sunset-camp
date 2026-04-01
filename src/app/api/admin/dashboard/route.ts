import { getMongoDb } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  try {
    console.log('API HIT: /api/admin/dashboard');
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return Response.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }

    const cookieStore = cookies();
    const headerStore = headers();
    const authHeader = headerStore.get('authorization') || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const token =
      bearerToken ||
      cookieStore.get('adminToken')?.value ||
      cookieStore.get('token')?.value ||
      '';

    if (!token) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
    } catch {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const role = String(decoded?.role || '');
    if (role !== 'admin') {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

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
    console.error('ADMIN_DASHBOARD_ERROR:', error);
    return Response.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }

  return Response.json({ success: false, error: 'Unknown error' }, { status: 500 });
}
