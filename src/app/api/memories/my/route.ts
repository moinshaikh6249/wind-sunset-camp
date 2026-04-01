import { connectMongoose } from '@/lib/mongoose';
import Memory from '@/models/Memory';
import { headers, cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    console.log('API HIT: /api/memories/my');

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

    await connectMongoose();

    const memories = await Memory.find({})
      .sort({ createdAt: -1 })
      .lean();

    const data = memories.map((memory: any) => ({
      id: String(memory._id),
      ...memory,
      _id: String(memory._id),
    }));

    return Response.json({ success: true, data });
  } catch (error) {
    console.error('MEMORIES MY ERROR:', error);
    return Response.json({ success: false, error: 'Failed to fetch memories' }, { status: 500 });
  }
}
