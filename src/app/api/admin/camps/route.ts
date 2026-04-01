import { getMongoDb } from '@/lib/mongodb';
import { headers, cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    console.log('API HIT: /api/admin/camps');

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

    const camps = await db
      .collection(collectionName)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const data = camps.map((doc) => ({
      id: String(doc._id),
      ...doc,
      _id: String(doc._id),
    }));

    return Response.json({ success: true, data, camps: data });
  } catch (error) {
    console.error('ADMIN CAMPS ERROR:', error);
    return Response.json({ success: false, error: 'Failed to fetch camps' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    console.log('API HIT: /api/admin/camps POST');

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

    const result = await db.collection(collectionName).insertOne({
      ...body,
      createdAt: new Date(),
    });

    return Response.json(
      { success: true, data: { id: String(result.insertedId), ...body } },
      { status: 201 }
    );
  } catch (error) {
    console.error('ADMIN CAMP CREATE ERROR:', error);
    return Response.json({ success: false, error: 'Failed to create camp' }, { status: 500 });
  }
}
