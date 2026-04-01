import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectMongoose } from '@/lib/mongoose';
import User from '@/models/User';

export const runtime = 'nodejs';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const emailNormalized = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }

    if (!emailNormalized || !password) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    await connectMongoose();

    const user = await User.findOne({ email: emailNormalized }).select('+password');

    if (!user || !user.password) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, String(user.password));

    if (!isMatch) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: String(user._id), id: String(user._id), role: user.role || 'user' },
      jwtSecret,
      { expiresIn: '7d' }
    );

    const res = Response.json(
      {
        success: true,
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

    res.headers.set(
      'Set-Cookie',
      `token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`
    );

    return res;
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
