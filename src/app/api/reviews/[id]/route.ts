import { connectMongoose } from '@/lib/mongoose';
import Review from '@/models/Review';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log('API HIT: /api/reviews/[id]', params.id);
    await connectMongoose();

    const review = await Review.findById(params.id).lean();

    if (!review) {
      return Response.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: {
        id: String(review._id),
        ...review,
        _id: String(review._id),
      },
    });
  } catch (error) {
    console.error('REVIEW GET ERROR:', error);
    return Response.json({ success: false, error: 'Failed to fetch review' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log('API HIT: /api/reviews/[id] PUT', params.id);
    const body = await req.json();

    await connectMongoose();

    const review = await Review.findByIdAndUpdate(params.id, body, { new: true }).lean();

    if (!review) {
      return Response.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: {
        id: String(review._id),
        ...review,
        _id: String(review._id),
      },
    });
  } catch (error) {
    console.error('REVIEW UPDATE ERROR:', error);
    return Response.json({ success: false, error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log('API HIT: /api/reviews/[id] DELETE', params.id);
    await connectMongoose();

    const review = await Review.findByIdAndDelete(params.id);

    if (!review) {
      return Response.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    return Response.json({ success: true, data: review });
  } catch (error) {
    console.error('REVIEW DELETE ERROR:', error);
    return Response.json({ success: false, error: 'Failed to delete review' }, { status: 500 });
  }
}
