import { getMongoDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { headers, cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log('API HIT: /api/admin/camps/[id] PUT', params.id);

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

    const body = await req.json();
    const db = await getMongoDb();
    const collectionName = process.env.MONGODB_CAMPS_COLLECTION || 'camps';

    const result = await db.collection(collectionName).findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: body },
      { returnDocument: 'after' }
    );

    const updatedCamp = result?.value;
    if (!updatedCamp) {
      return Response.json({ success: false, error: 'Camp not found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: {
        id: String(updatedCamp._id),
        ...updatedCamp,
      },
    });
  } catch (error) {
    console.error('ADMIN CAMP UPDATE ERROR:', error);
    return Response.json({ success: false, error: 'Failed to update camp' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log('API HIT: /api/admin/camps/[id] DELETE', params.id);

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

    const db = await getMongoDb();
    const collectionName = process.env.MONGODB_CAMPS_COLLECTION || 'camps';

    const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return Response.json({ success: false, error: 'Camp not found' }, { status: 404 });
    }

    return Response.json({ success: true, data: { message: 'Camp deleted' } });
  } catch (error) {
    console.error('ADMIN CAMP DELETE ERROR:', error);
    return Response.json({ success: false, error: 'Failed to delete camp' }, { status: 500 });
  }
}
