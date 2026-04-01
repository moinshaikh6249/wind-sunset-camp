import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectMongoose } from '@/lib/mongoose';
import User from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('API HIT: /api/auth/me');
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }

    const authHeader = req.headers.get('authorization') || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const cookieToken = req.cookies.get('token')?.value || '';
    const token = bearerToken || cookieToken;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
    } catch {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userId = String(decoded?.userId || decoded?.id || '');
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectMongoose();
    const user = await User.findById(userId).lean();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: String(user._id),
        _id: String(user._id),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    console.error('[AUTH_ME] Failed', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({ success: false, error: 'Unknown error' }, { status: 500 });
}
