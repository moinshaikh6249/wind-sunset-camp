import { connectMongoose } from '@/lib/mongoose';
import Booking from '@/models/Booking';
import { headers, cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    console.log('API HIT: /api/bookings/my');

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return Response.json({ success: false, error: 'Server error' }, { status: 500 });
    }

    const headerStore = headers();
    const cookieStore = cookies();
    const authHeader = headerStore.get('authorization') || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const token = bearerToken || cookieStore.get('token')?.value || '';

    if (!token) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
    } catch {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongoose();

    const bookings = await Booking.find({ email: { $exists: true } })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return Response.json({
      success: true,
      data: bookings,
      bookings: bookings,
    });
  } catch (error) {
    console.error('BOOKINGS MY ERROR:', error);
    return Response.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
