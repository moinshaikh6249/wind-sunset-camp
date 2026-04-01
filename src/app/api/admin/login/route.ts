import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectMongoose } from '@/lib/mongoose';
import Admin from '@/models/Admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SEVEN_DAYS = 60 * 60 * 24 * 7;
const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export async function POST(req: NextRequest) {
  try {
    console.log('[ADMIN_LOGIN] Request received');

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[ADMIN_LOGIN] JWT_SECRET missing');
      return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }

    const body = await req.json();
    const emailNormalized = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    console.log('[ADMIN_LOGIN] EMAIL:', emailNormalized);

    if (!emailNormalized || !password) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    await connectMongoose();
    const admin = await Admin.findOne({ email: emailNormalized }).select('+password');

    console.log('[ADMIN_LOGIN] USER FOUND:', !!admin);

    if (!admin || !admin.password) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const storedPassword = String(admin.password || '');
    const isHashedPassword = BCRYPT_HASH_REGEX.test(storedPassword);

    let isMatch = false;

    if (isHashedPassword) {
      try {
        isMatch = await bcrypt.compare(password, storedPassword);
      } catch (error) {
        console.error('[ADMIN_LOGIN] bcrypt.compare failed', error);
        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
      }
    } else {
      isMatch = password === storedPassword;
      if (isMatch) {
        admin.password = await bcrypt.hash(password, 10);
        await admin.save();
      }
    }

    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: String(admin._id), role: 'admin', email: admin.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    cookies().set('adminToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SEVEN_DAYS,
    });

    console.log('[ADMIN_LOGIN] Login successful for', emailNormalized);

    return NextResponse.json(
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
  } catch (error) {
    console.error('[ADMIN_LOGIN] Login failed', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
