import { headers, cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import cloudinary, { getMissingCloudinaryVars } from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    console.log('API HIT: /api/admin/upload-image');

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

    const missingCloudinaryVars = getMissingCloudinaryVars();
    if (missingCloudinaryVars.length > 0) {
      return Response.json(
        {
          success: false,
          error: `Missing Cloudinary environment variables: ${missingCloudinaryVars.join(', ')}`,
        },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('image') || formData.get('file');

    if (!file || typeof file === 'string' || !(file as File).arrayBuffer) {
      return Response.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const typedFile = file as File;
    const bytes = await typedFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const dataUri = `data:${typedFile.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'wind-sunset-camp',
      resource_type: 'image',
    });

    return Response.json(
      {
        success: true,
        imageUrl: result.secure_url,
        data: {
          image: result.secure_url,
          imageUrl: result.secure_url,
          secure_url: result.secure_url,
          public_id: result.public_id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('UPLOAD IMAGE ERROR:', error);
    return Response.json({ success: false, error: 'Failed to upload image' }, { status: 500 });
  }
}
