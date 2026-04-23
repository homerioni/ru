import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { withClubAdminRequestLog } from '@/lib/clubAdminRequestLogger';

export async function POST(req: NextRequest) {
  return withClubAdminRequestLog(req, async () => {
    try {
      const formData = await req.formData();
      const imageFile = formData.get('image') as File;

      const blob = await put(imageFile.name, imageFile, {
        access: 'public',
        allowOverwrite: true,
        addRandomSuffix: true,
      });

      revalidatePath('/');

      return NextResponse.json(blob);
    } catch (error) {
      console.error('Upload error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }
  });
}

// Отключаем стандартный парсер Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};
