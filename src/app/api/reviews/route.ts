import { connectMongoose } from '@/lib/mongoose';
import Review from '@/models/Review';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    console.log('API HIT: /api/reviews');
    await connectMongoose();

    const reviews = await Review.find({ visible: true })
      .sort({ pinned: -1, createdAt: -1 })
      .lean();

    const data = reviews.map((review: any) => ({
      id: String(review._id),
      ...review,
      _id: String(review._id),
    }));

    return Response.json({ success: true, data });
  } catch (error) {
    console.error('REVIEWS ERROR:', error);
    return Response.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    console.log('API HIT: /api/reviews POST');
    const body = await req.json();

    const { name, email, rating, comment, campId } = body;

    if (!name || !email || !rating || !comment) {
      return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await connectMongoose();

    const review = await Review.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: String(comment).trim(),
      campId: campId || null,
      visible: true,
    });

    return Response.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    console.error('REVIEW CREATE ERROR:', error);
    return Response.json({ success: false, error: 'Failed to create review' }, { status: 500 });
  }
}
