import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
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
}

// Отключаем стандартный парсер Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};
