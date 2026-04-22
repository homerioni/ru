import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '../../../../../prisma/prisma-client';

type Params = { params: Promise<{ id: string }> };

function parseImageSrcs(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (value === null) return [];
  if (Array.isArray(value)) {
    return value.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
  }
  return undefined;
}

export async function PATCH(req: NextRequest, context: Params) {
  const { id } = await context.params;
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

  if (body.title !== undefined) data.title = String(body.title);
  if (body.description !== undefined) data.description = String(body.description);
  if (body.imageSrcs !== undefined) {
    data.imageSrcs = parseImageSrcs(body.imageSrcs) ?? [];
  }
  if (body.sortOrder !== undefined) {
    data.sortOrder =
      typeof body.sortOrder === 'number' ? body.sortOrder : Number(body.sortOrder) || 0;
  }
  if (body.isPublished !== undefined) data.isPublished = Boolean(body.isPublished);

  const update = await prisma.siteUpdate.update({
    where: { id },
    data,
  });

  revalidatePath('/');
  return NextResponse.json(update);
}

export async function DELETE(_req: NextRequest, context: Params) {
  const { id } = await context.params;

  await prisma.siteUpdate.delete({ where: { id } });

  revalidatePath('/');
  return NextResponse.json({ ok: true });
}
