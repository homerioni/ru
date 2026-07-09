import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '../../../../prisma/prisma-client';
import { withClubAdminRequestLog } from '@/lib/clubAdminRequestLogger';
import { MY_CLUB_ID } from '@/constants';

type PhotoInput = {
  imageSrc: string;
  caption?: string | null;
  sortOrder?: number;
  isPublished?: boolean;
};

function parsePhotos(value: unknown): PhotoInput[] | null {
  if (!Array.isArray(value)) return null;

  const photos: PhotoInput[] = [];

  for (const item of value) {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      continue;
    }

    const row = item as Record<string, unknown>;
    const imageSrc = typeof row.imageSrc === 'string' ? row.imageSrc.trim() : '';

    if (!imageSrc) continue;

    photos.push({
      imageSrc,
      caption:
        row.caption === null || row.caption === undefined
          ? null
          : String(row.caption),
      sortOrder:
        typeof row.sortOrder === 'number'
          ? row.sortOrder
          : Number(row.sortOrder) || 0,
      isPublished: row.isPublished === undefined ? true : Boolean(row.isPublished),
    });
  }

  return photos;
}

function revalidateClubGallery(clubId: number) {
  revalidatePath(`/club/${clubId}`);
  revalidatePath(`/club/${clubId}/gallery`);

  if (clubId === MY_CLUB_ID) {
    revalidatePath('/');
    revalidatePath('/gallery');
  }
}

export async function GET(req: NextRequest) {
  return withClubAdminRequestLog(req, async () => {
    const clubId = Number(req.nextUrl.searchParams.get('clubId'));
    const all = req.nextUrl.searchParams.get('all') === '1';

    if (!Number.isFinite(clubId)) {
      return NextResponse.json({ error: 'clubId is required' }, { status: 400 });
    }

    const photos = await prisma.clubPhoto.findMany({
      where: {
        clubId,
        ...(all ? {} : { isPublished: true }),
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ photos });
  });
}

export async function POST(req: NextRequest) {
  return withClubAdminRequestLog(req, async () => {
    let body: Record<string, unknown> = {};

    try {
      const parsed: unknown = await req.json();
      if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
        body = parsed as Record<string, unknown>;
      }
    } catch {
      body = {};
    }

    const clubId = Number(body.clubId);
    if (!Number.isFinite(clubId)) {
      return NextResponse.json({ error: 'clubId is required' }, { status: 400 });
    }

    const batch = parsePhotos(body.photos);
    if (batch?.length) {
      const created = await prisma.$transaction(
        batch.map((photo) =>
          prisma.clubPhoto.create({
            data: {
              clubId,
              imageSrc: photo.imageSrc,
              caption: photo.caption ?? null,
              sortOrder: photo.sortOrder ?? 0,
              isPublished: photo.isPublished ?? true,
            },
          })
        )
      );

      revalidateClubGallery(clubId);
      return NextResponse.json({ photos: created });
    }

    const imageSrc =
      typeof body.imageSrc === 'string' ? body.imageSrc.trim() : '';

    if (!imageSrc) {
      return NextResponse.json({ error: 'imageSrc is required' }, { status: 400 });
    }

    const photo = await prisma.clubPhoto.create({
      data: {
        clubId,
        imageSrc,
        caption:
          body.caption === null || body.caption === undefined
            ? null
            : String(body.caption),
        sortOrder:
          typeof body.sortOrder === 'number'
            ? body.sortOrder
            : Number(body.sortOrder) || 0,
        isPublished: body.isPublished === undefined ? true : Boolean(body.isPublished),
      },
    });

    revalidateClubGallery(clubId);
    return NextResponse.json(photo);
  });
}

export async function DELETE(req: NextRequest) {
  return withClubAdminRequestLog(req, async () => {
    let body: Record<string, unknown> = {};

    try {
      const parsed: unknown = await req.json();
      if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
        body = parsed as Record<string, unknown>;
      }
    } catch {
      body = {};
    }

    const ids = Array.isArray(body.ids)
      ? body.ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];

    if (!ids.length) {
      return NextResponse.json({ error: 'ids is required' }, { status: 400 });
    }

    const photos = await prisma.clubPhoto.findMany({
      where: { id: { in: ids } },
      select: { clubId: true },
    });

    await prisma.clubPhoto.deleteMany({ where: { id: { in: ids } } });

    const clubIds = [...new Set(photos.map((photo) => photo.clubId))];
    clubIds.forEach(revalidateClubGallery);

    return NextResponse.json({ ok: true });
  });
}
