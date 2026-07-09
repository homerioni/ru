import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '../../../../../prisma/prisma-client';
import { withClubAdminRequestLog } from '@/lib/clubAdminRequestLogger';
import { MY_CLUB_ID } from '@/constants';

type Params = { params: Promise<{ id: string }> };

function revalidateClubGallery(clubId: number) {
  revalidatePath(`/club/${clubId}`);
  revalidatePath(`/club/${clubId}/gallery`);

  if (clubId === MY_CLUB_ID) {
    revalidatePath('/');
    revalidatePath('/gallery');
  }
}

export async function PATCH(req: NextRequest, context: Params) {
  return withClubAdminRequestLog(req, async () => {
    const { id } = await context.params;
    const photoId = Number(id);

    if (!Number.isFinite(photoId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    let body: Record<string, unknown> = {};

    try {
      const parsed: unknown = await req.json();
      if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
        body = parsed as Record<string, unknown>;
      }
    } catch {
      body = {};
    }

    const data: Record<string, unknown> = {};

    if (body.imageSrc !== undefined) {
      const imageSrc = String(body.imageSrc).trim();
      if (!imageSrc) {
        return NextResponse.json({ error: 'imageSrc cannot be empty' }, { status: 400 });
      }
      data.imageSrc = imageSrc;
    }

    if (body.caption !== undefined) {
      data.caption =
        body.caption === null || body.caption === ''
          ? null
          : String(body.caption);
    }

    if (body.sortOrder !== undefined) {
      data.sortOrder =
        typeof body.sortOrder === 'number'
          ? body.sortOrder
          : Number(body.sortOrder) || 0;
    }

    if (body.isPublished !== undefined) {
      data.isPublished = Boolean(body.isPublished);
    }

    const photo = await prisma.clubPhoto.update({
      where: { id: photoId },
      data,
    });

    revalidateClubGallery(photo.clubId);
    return NextResponse.json(photo);
  });
}

export async function DELETE(_req: NextRequest, context: Params) {
  return withClubAdminRequestLog(_req, async () => {
    const { id } = await context.params;
    const photoId = Number(id);

    if (!Number.isFinite(photoId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const photo = await prisma.clubPhoto.delete({ where: { id: photoId } });

    revalidateClubGallery(photo.clubId);
    return NextResponse.json({ ok: true });
  });
}
