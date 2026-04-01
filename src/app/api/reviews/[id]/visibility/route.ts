import { connectMongoose } from '@/lib/mongoose';
import Review from '@/models/Review';
import { headers, cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log('API HIT: /api/reviews/[id]/visibility', params.id);

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

    const review = await Review.findById(params.id).lean();
    if (!review) {
      return Response.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    const updated = await Review.findByIdAndUpdate(
      params.id,
      { visible: !review.visible },
      { new: true }
    ).lean();

    return Response.json({
      success: true,
      data: {
        id: String(updated?._id),
        ...updated,
        _id: String(updated?._id),
      },
    });
  } catch (error) {
    console.error('REVIEW VISIBILITY ERROR:', error);
    return Response.json({ success: false, error: 'Failed to update review visibility' }, { status: 500 });
  }
}
