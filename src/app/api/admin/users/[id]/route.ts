import { connectMongoose } from '@/lib/mongoose';
import User from '@/models/User';
import { headers, cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log('API HIT: /api/admin/users/[id] DELETE', params.id);

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

    const user = await User.findByIdAndDelete(params.id);

    if (!user) {
      return Response.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return Response.json({ success: true, data: user });
  } catch (error) {
    console.error('USER DELETE ERROR:', error);
    return Response.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}
