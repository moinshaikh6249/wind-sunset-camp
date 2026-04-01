import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectMongoose } from '@/lib/mongoose';
import Admin from '@/models/Admin';

export const runtime = 'nodejs';

const SEVEN_DAYS = 60 * 60 * 24 * 7;

export async function POST(req: NextRequest) {
  try {
    console.log('[ADMIN_LOGIN] Request received');

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[ADMIN_LOGIN] JWT_SECRET missing');
      return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }

    const body = await req.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    await connectMongoose();
    const admin = await Admin.findOne({ email }).select('+password').lean();

    if (!admin || !admin.password) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, admin.password);
    } catch (error) {
      console.error('[ADMIN_LOGIN] bcrypt.compare failed', error);
      return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }

    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: String(admin._id), role: 'admin', email: admin.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        token,
        admin: {
          id: String(admin._id),
          _id: String(admin._id),
          name: admin.name,
          email: admin.email,
          role: 'admin',
        },
      },
      { status: 200 }
    );

    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SEVEN_DAYS,
    });

    console.log('[ADMIN_LOGIN] Login successful for', email);
    return response;
  } catch (error) {
    console.error('[ADMIN_LOGIN] Login failed', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
