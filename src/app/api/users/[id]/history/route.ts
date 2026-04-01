import { connectMongoose } from '@/lib/mongoose';
import User from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log('API HIT: /api/users/[id]/history', params.id);

    await connectMongoose();

    const user = await User.findById(params.id).select('-password').lean();

    if (!user) {
      return Response.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Return user history data (can be extended with booking history)
    return Response.json({
      success: true,
      data: {
        id: String(user._id),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        history: [
          {
            type: 'joined',
            date: user.createdAt,
            description: 'Joined the platform',
          },
        ],
      },
    });
  } catch (error) {
    console.error('USER HISTORY ERROR:', error);
    return Response.json({ success: false, error: 'Failed to fetch user history' }, { status: 500 });
  }
}
