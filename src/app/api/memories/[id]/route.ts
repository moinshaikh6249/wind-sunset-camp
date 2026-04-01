import { connectMongoose } from '@/lib/mongoose';
import Memory from '@/models/Memory';
import { headers, cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log('API HIT: /api/memories/[id] DELETE', params.id);

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

    const memory = await Memory.findByIdAndDelete(params.id);

    if (!memory) {
      return Response.json({ success: false, error: 'Memory not found' }, { status: 404 });
    }

    return Response.json({ success: true, data: memory });
  } catch (error) {
    console.error('MEMORY DELETE ERROR:', error);
    return Response.json({ success: false, error: 'Failed to delete memory' }, { status: 500 });
  }
}
