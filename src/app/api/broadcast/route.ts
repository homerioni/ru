import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '../../../../prisma/prisma-client';
import { generateJitsiRoomName, parseStreamInput } from '@/utils/parseStreamInput';

function revalidateLivePaths() {
  revalidatePath('/live');
  revalidatePath('/');
}

export async function GET(req: NextRequest) {
  const activeOnly = req.nextUrl.searchParams.get('active') === '1';
  const all = req.nextUrl.searchParams.get('all') === '1';

  if (activeOnly) {
    const broadcast = await prisma.liveBroadcast.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json({ broadcast });
  }

  const broadcasts = await prisma.liveBroadcast.findMany({
    orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
    ...(all ? {} : { where: { isActive: true } }),
  });

  return NextResponse.json({ broadcasts });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    const parsed: unknown = await req.json();
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      body = parsed as Record<string, unknown>;
    }
  } catch {
    body = {};
  }

  const streamInput = String(body.streamInput ?? '');
  const streamEmbedUrl = parseStreamInput(streamInput);

  if (!streamEmbedUrl) {
    return NextResponse.json(
      { error: 'Не удалось распознать ссылку на трансляцию' },
      { status: 400 }
    );
  }

  const isActive = Boolean(body.isActive ?? false);
  const jitsiRoomName =
    typeof body.jitsiRoomName === 'string' && body.jitsiRoomName.trim()
      ? body.jitsiRoomName.trim()
      : generateJitsiRoomName();

  if (isActive) {
    await prisma.liveBroadcast.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  const broadcast = await prisma.liveBroadcast.create({
    data: {
      title: String(body.title ?? 'Трансляция'),
      description: body.description ? String(body.description) : null,
      streamInput,
      streamEmbedUrl,
      jitsiRoomName,
      isActive,
    },
  });

  revalidateLivePaths();
  return NextResponse.json(broadcast);
}
