import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectMongoose } from '@/lib/mongoose';
import User from '@/models/User';

export const runtime = 'nodejs';

const SEVEN_DAYS = 60 * 60 * 24 * 7;
const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export async function POST(req: NextRequest) {
  try {
    console.log('[AUTH_LOGIN] Request received');

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[AUTH_LOGIN] JWT_SECRET missing');
      return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }

    const body = await req.json();
    const emailNormalized = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    console.log('LOGIN EMAIL:', emailNormalized);

    if (!emailNormalized || !password) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    await connectMongoose();

    const user = await User.findOne({ email: emailNormalized }).select('+password');

    console.log('USER FOUND:', !!user);

    if (!user || !user.password) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const storedPassword = String(user.password || '');
    const isHashedPassword = BCRYPT_HASH_REGEX.test(storedPassword);

    let isMatch = false;

    if (isHashedPassword) {
      try {
        isMatch = await bcrypt.compare(password, storedPassword);
      } catch (error) {
        console.error('[AUTH_LOGIN] bcrypt.compare failed', error);
        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
      }
    } else {
      isMatch = password === storedPassword;
      if (isMatch) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    }

    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: String(user._id), role: user.role || 'user', email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    cookies().set('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SEVEN_DAYS,
    });

    console.log('[AUTH_LOGIN] Login successful for', emailNormalized);

    return NextResponse.json(
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
  } catch (error) {
    console.error('[AUTH_LOGIN] Login failed', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
