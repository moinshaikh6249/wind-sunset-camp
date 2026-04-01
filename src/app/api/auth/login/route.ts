import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectMongoose } from '@/lib/mongoose';
import User from '@/models/User';

export const runtime = 'nodejs';

const SEVEN_DAYS = 60 * 60 * 24 * 7;

export async function POST(req: NextRequest) {
  try {
    console.log('[AUTH_LOGIN] Request received');

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[AUTH_LOGIN] JWT_SECRET missing');
      return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }

    const body = await req.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    await connectMongoose();

    const user = await User.findOne({ email }).select('+password').lean();

    if (!user || !user.password) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('[AUTH_LOGIN] bcrypt.compare failed', error);
      return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }

    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: String(user._id), role: user.role || 'user', email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: String(user._id),
          _id: String(user._id),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role || 'user',
        },
      },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SEVEN_DAYS,
    });

    console.log('[AUTH_LOGIN] Login successful for', email);
    return response;
  } catch (error) {
    console.error('[AUTH_LOGIN] Login failed', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
