import { getMongoDb } from '@/lib/mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    console.log('API HIT: /api/camps/search');
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    const db = await getMongoDb();
    const collectionName = process.env.MONGODB_CAMPS_COLLECTION || 'camps';

    const camps = await db
      .collection(collectionName)
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { location: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(24)
      .toArray();

    const normalized = camps.map((doc) => ({
      id: String(doc._id),
      ...doc,
      _id: undefined,
    }));

    return Response.json({ success: true, data: normalized });
  } catch (error) {
    console.error('CAMPS SEARCH ERROR:', error);
    return Response.json({ success: false, error: 'Failed to search camps' }, { status: 500 });
  }
}
