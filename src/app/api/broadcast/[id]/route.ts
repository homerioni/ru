import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '../../../../../prisma/prisma-client';
import { parseStreamInput } from '@/utils/parseStreamInput';

type Params = { params: Promise<{ id: string }> };

function revalidateLivePaths() {
  revalidatePath('/live');
  revalidatePath('/');
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
  if (body.description !== undefined) {
    data.description = body.description ? String(body.description) : null;
  }

  if (body.streamInput !== undefined) {
    const streamInput = String(body.streamInput);
    const streamEmbedUrl = parseStreamInput(streamInput);
    if (!streamEmbedUrl) {
      return NextResponse.json(
        { error: 'Не удалось распознать ссылку на трансляцию' },
        { status: 400 }
      );
    }
    data.streamInput = streamInput;
    data.streamEmbedUrl = streamEmbedUrl;
  }

  if (body.isActive !== undefined) {
    const isActive = Boolean(body.isActive);
    data.isActive = isActive;

    if (isActive) {
      await prisma.liveBroadcast.updateMany({
        where: { isActive: true, NOT: { id } },
        data: { isActive: false },
      });
    }
  }

  const broadcast = await prisma.liveBroadcast.update({
    where: { id },
    data,
  });

  revalidateLivePaths();
  return NextResponse.json(broadcast);
}

export async function DELETE(_req: NextRequest, context: Params) {
  const { id } = await context.params;

  await prisma.liveBroadcast.delete({ where: { id } });

  revalidateLivePaths();
  return NextResponse.json({ ok: true });
}
