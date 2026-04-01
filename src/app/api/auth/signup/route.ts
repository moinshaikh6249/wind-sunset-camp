import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { connectMongoose } from '@/lib/mongoose';
import User from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SEVEN_DAYS = 60 * 60 * 24 * 7;

export async function POST(req: NextRequest) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('[AUTH_SIGNUP] JWT_SECRET missing');
      return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }

    const body = await req.json();
    const firstName = String(body?.firstName || '').trim();
    const lastName = String(body?.lastName || '').trim();
    const emailNormalized = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    if (!firstName || !emailNormalized || !password) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, message: 'Password must be at least 8 characters' }, { status: 400 });
    }

    await connectMongoose();

    const existingUser = await User.findOne({ email: emailNormalized }).lean();
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'An account with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = (await User.create({
      firstName,
      lastName,
      email: emailNormalized,
      password: hashedPassword,
      phone: String(body?.phone || '').trim() || undefined,
      role: 'user',
    })) as any;

    const token = jwt.sign(
      { id: String(createdUser._id), role: 'user', email: createdUser.email },
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

    return NextResponse.json(
      {
        success: true,
        message: 'Signup successful',
        token,
        user: {
          id: String(createdUser._id),
          _id: String(createdUser._id),
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          email: createdUser.email,
          phone: createdUser.phone,
          role: createdUser.role || 'user',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[AUTH_SIGNUP] Failed', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
