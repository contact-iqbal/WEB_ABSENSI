import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    const fileBase64 = formData.file; // base64 string
    const folder = formData.folder || 'web_absensi/izin';

    if (!fileBase64) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary with an increased timeout
    const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
      folder: folder,
      timeout: 60000, // 60 seconds
    });

    return NextResponse.json(
      {
        success: true,
        url: uploadResponse.secure_url,
        public_id: uploadResponse.public_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { success: false, message: 'Upload failed', error },
      { status: 500 }
    );
  }
}
