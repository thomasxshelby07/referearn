import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const data = await req.formData();
        const file = data.get('file') as File;
        if (!file) return NextResponse.json({ error: 'No file found' }, { status: 400 });

        const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
        const api_key = process.env.CLOUDINARY_API_KEY;
        const api_secret = process.env.CLOUDINARY_API_SECRET;

        if (!cloud_name || !api_key || !api_secret) {
            return NextResponse.json({ error: 'Cloudinary credentials are missing on Vercel. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to Vercel Environment Variables.' }, { status: 500 });
        }

        cloudinary.config({ cloud_name, api_key, api_secret });

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'referearn_bot' },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
            uploadStream.end(buffer);
        });

        return NextResponse.json(result);
    } catch (err: any) {
        console.error('API Upload Route Error:', err);
        return NextResponse.json({ error: err.message || 'Unknown upload error' }, { status: 500 });
    }
}
