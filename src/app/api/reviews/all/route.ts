import { connectMongoose } from '@/lib/mongoose';
import Review from '@/models/Review';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    console.log('API HIT: /api/reviews/all');
    await connectMongoose();

    const reviews = await Review.find({})
      .sort({ createdAt: -1 })
      .lean();

    const data = reviews.map((review: any) => ({
      id: String(review._id),
      ...review,
      _id: String(review._id),
    }));

    return Response.json({ success: true, data, reviews: data });
  } catch (error) {
    console.error('REVIEWS ALL ERROR:', error);
    return Response.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
