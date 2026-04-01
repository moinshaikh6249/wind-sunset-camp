import { getMongoDb } from '@/lib/mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    console.log('API HIT: /api/gallery POST');

    const body = await req.json();
    const { title, url, imageUrl } = body;

    if (!url && !imageUrl) {
      return Response.json({ success: false, error: 'Missing image URL' }, { status: 400 });
    }

    const resolvedImageUrl = String(url || imageUrl || '').trim();
    if (!/^https?:\/\//i.test(resolvedImageUrl) && !resolvedImageUrl.startsWith('/')) {
      return Response.json({ success: false, error: 'Invalid image URL' }, { status: 400 });
    }

    const db = await getMongoDb();
    const collectionName = process.env.MONGODB_GALLERY_COLLECTION || 'galleryImages';

    const result = await db.collection(collectionName).insertOne({
      title: title || 'Gallery Image',
      url: resolvedImageUrl,
      image: resolvedImageUrl,
      imageUrl: resolvedImageUrl,
      createdAt: new Date(),
    });

    return Response.json(
      {
        success: true,
        data: {
          id: String(result.insertedId),
          title,
          image: resolvedImageUrl,
          imageUrl: resolvedImageUrl,
          url: resolvedImageUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('GALLERY POST ERROR:', error);
    return Response.json({ success: false, error: 'Failed to add gallery image' }, { status: 500 });
  }
}
