import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../../prisma/prisma-client';
import { authOptions } from '@/lib/auth';

const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_MS = 2000;
const MESSAGES_LIMIT = 100;

export async function GET(req: NextRequest) {
  const broadcastId = req.nextUrl.searchParams.get('broadcastId');
  const after = req.nextUrl.searchParams.get('after');

  if (!broadcastId) {
    return NextResponse.json({ error: 'broadcastId required' }, { status: 400 });
  }

  const messages = await prisma.liveChatMessage.findMany({
    where: {
      broadcastId,
      ...(after
        ? {
            createdAt: { gt: new Date(after) },
          }
        : {}),
    },
    orderBy: { createdAt: 'asc' },
    take: MESSAGES_LIMIT,
  });

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  let body: Record<string, unknown> = {};
  try {
    const parsed: unknown = await req.json();
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      body = parsed as Record<string, unknown>;
    }
  } catch {
    body = {};
  }

  const broadcastId = String(body.broadcastId ?? '');
  const message = String(body.message ?? '').trim();
  const guestName = String(body.guestName ?? '').trim();

  if (!broadcastId || !message) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: 'Message too long' }, { status: 400 });
  }

  const broadcast = await prisma.liveBroadcast.findFirst({
    where: { id: broadcastId, isActive: true },
  });

  if (!broadcast) {
    return NextResponse.json({ error: 'Broadcast not active' }, { status: 404 });
  }

  const username =
    session?.user?.name ||
    session?.user?.username ||
    guestName;

  if (!username || username.length < 2 || username.length > 32) {
    return NextResponse.json(
      { error: 'Укажите имя (от 2 до 32 символов)' },
      { status: 400 }
    );
  }

  const userId = session?.user?.id ?? null;

  const recent = await prisma.liveChatMessage.findFirst({
    where: {
      broadcastId,
      ...(userId ? { userId } : { username, userId: null }),
    },
    orderBy: { createdAt: 'desc' },
  });

  if (
    recent &&
    Date.now() - recent.createdAt.getTime() < RATE_LIMIT_MS
  ) {
    return NextResponse.json(
      { error: 'Подождите пару секунд' },
      { status: 429 }
    );
  }

  const chatMessage = await prisma.liveChatMessage.create({
    data: {
      broadcastId,
      username,
      userId,
      message,
    },
  });

  return NextResponse.json(chatMessage);
}
