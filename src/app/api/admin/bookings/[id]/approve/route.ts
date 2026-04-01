import { connectMongoose } from '@/lib/mongoose';
import Booking from '@/models/Booking';
import { headers, cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log('API HIT: /api/admin/bookings/[id]/approve', params.id);

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return Response.json({ success: false, error: 'Server error' }, { status: 500 });
    }

    const headerStore = headers();
    const cookieStore = cookies();
    const authHeader = headerStore.get('authorization') || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const token = bearerToken || cookieStore.get('adminToken')?.value || cookieStore.get('token')?.value || '';

    if (!token) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
    } catch {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (decoded.role !== 'admin') {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await connectMongoose();

    const booking = await Booking.findByIdAndUpdate(
      params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!booking) {
      return Response.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    return Response.json({ success: true, data: booking });
  } catch (error) {
    console.error('BOOKING APPROVE ERROR:', error);
    return Response.json({ success: false, error: 'Failed to approve booking' }, { status: 500 });
  }
}
