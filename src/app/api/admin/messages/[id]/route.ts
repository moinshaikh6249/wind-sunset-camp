import { connectMongoose } from '@/lib/mongoose';
import Message from '@/models/Message';
import { headers, cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log('API HIT: /api/admin/messages/[id]/read', params.id);

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

    const message = await Message.findByIdAndUpdate(
      params.id,
      { read: true },
      { new: true }
    ).lean();

    if (!message) {
      return Response.json({ success: false, error: 'Message not found' }, { status: 404 });
    }

    return Response.json({ success: true, data: message });
  } catch (error) {
    console.error('MESSAGE MARK READ ERROR:', error);
    return Response.json({ success: false, error: 'Failed to mark message as read' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log('API HIT: /api/admin/messages/[id] DELETE', params.id);

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

    const message = await Message.findByIdAndDelete(params.id);

    if (!message) {
      return Response.json({ success: false, error: 'Message not found' }, { status: 404 });
    }

    return Response.json({ success: true, data: message });
  } catch (error) {
    console.error('MESSAGE DELETE ERROR:', error);
    return Response.json({ success: false, error: 'Failed to delete message' }, { status: 500 });
  }
}
