import { connectMongoose } from '@/lib/mongoose';
import User from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log('API HIT: /api/users/[id]', params.id);
    const userId = params.id;

    if (!userId) {
      return Response.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    await connectMongoose();

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return Response.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: {
        id: String(user._id),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('USER GET ERROR:', error);
    return Response.json({ success: false, error: 'Failed to fetch user' }, { status: 500 });
  }
}
