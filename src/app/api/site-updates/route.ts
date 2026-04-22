import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '../../../../prisma/prisma-client';

function parseImageSrcs(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (value === null) return [];
  if (Array.isArray(value)) {
    return value.filter(
      (x): x is string => typeof x === 'string' && x.trim().length > 0
    );
  }
  return undefined;
}

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get('all') === '1';

  const updates = await prisma.siteUpdate.findMany({
    where: all ? {} : { isPublished: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ updates });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    const parsed: unknown = await req.json();
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      body = parsed as Record<string, unknown>;
    }
  } catch {
    body = {};
  }

  const update = await prisma.siteUpdate.create({
    data: {
      title: String(body.title ?? ''),
      description: String(body.description ?? ''),
      imageSrcs: parseImageSrcs(body.imageSrcs) ?? [],
      sortOrder:
        typeof body.sortOrder === 'number'
          ? body.sortOrder
          : Number(body.sortOrder) || 0,
      isPublished: Boolean(body.isPublished ?? true),
    },
  });

  revalidatePath('/');
  return NextResponse.json(update);
}
