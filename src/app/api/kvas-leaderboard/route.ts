import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';
import { BELLY_NAMES } from '@/components/client/KvasGame/logic/balance';
import { bellyStage, rankName } from '@/components/client/KvasGame/logic/selectors';

const TOP_LIMIT = 50;
const MIN_WRITE_INTERVAL_MS = 20000;
const MAX_NICK_LEN = 24;
const MIN_NICK_LEN = 2;

const sanitizeNickname = (value: unknown): string => {
  const cleaned = String(value ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.slice(0, MAX_NICK_LEN);
};

const isValidClientId = (id: unknown): id is string =>
  typeof id === 'string' && /^[a-zA-Z0-9_-]{8,64}$/.test(id);

const toNonNegInt = (value: unknown, max = 1_000_000_000): number | null => {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.min(max, Math.floor(num));
};

export async function GET(req: NextRequest) {
  try {
    const clientId = req.nextUrl.searchParams.get('clientId');

    const [entries, total] = await Promise.all([
      prisma.kvasLeaderboardEntry.findMany({
        orderBy: [{ cans: 'desc' }, { sips: 'desc' }, { updatedAt: 'asc' }],
        take: TOP_LIMIT,
        select: {
          id: true,
          nickname: true,
          cans: true,
          sips: true,
          kvasiki: true,
          rankName: true,
          bellyName: true,
          updatedAt: true,
        },
      }),
      prisma.kvasLeaderboardEntry.count(),
    ]);

    let me: {
      rank: number;
      entry: (typeof entries)[number];
    } | null = null;

    if (isValidClientId(clientId)) {
      const idx = entries.findIndex((item) => item.id === clientId);
      if (idx >= 0) {
        me = { rank: idx + 1, entry: entries[idx] };
      } else {
        const own = await prisma.kvasLeaderboardEntry.findUnique({
          where: { id: clientId },
          select: {
            id: true,
            nickname: true,
            cans: true,
            sips: true,
            kvasiki: true,
            rankName: true,
            bellyName: true,
            updatedAt: true,
          },
        });
        if (own) {
          const ahead = await prisma.kvasLeaderboardEntry.count({
            where: {
              OR: [
                { cans: { gt: own.cans } },
                { cans: own.cans, sips: { gt: own.sips } },
                { cans: own.cans, sips: own.sips, updatedAt: { lt: own.updatedAt } },
              ],
            },
          });
          me = { rank: ahead + 1, entry: own };
        }
      }
    }

    return NextResponse.json({ entries, total, me });
  } catch (err) {
    console.error('[kvas-leaderboard GET]', err);
    return NextResponse.json({ error: 'Не удалось загрузить рейтинг' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    const parsed: unknown = await req.json();
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      body = parsed as Record<string, unknown>;
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const clientId = body.clientId;
  if (!isValidClientId(clientId)) {
    return NextResponse.json({ error: 'Invalid clientId' }, { status: 400 });
  }

  const nickname = sanitizeNickname(body.nickname);
  if (nickname.length < MIN_NICK_LEN) {
    return NextResponse.json(
      { error: `Никнейм должен быть от ${MIN_NICK_LEN} до ${MAX_NICK_LEN} символов` },
      { status: 400 }
    );
  }

  const cans = toNonNegInt(body.cans, 100_000);
  const sips = toNonNegInt(body.sips, 10_000_000);
  const kvasiki = toNonNegInt(body.kvasiki, 1_000_000_000);
  if (cans === null || sips === null || kvasiki === null) {
    return NextResponse.json({ error: 'Invalid score values' }, { status: 400 });
  }

  try {
    const existing = await prisma.kvasLeaderboardEntry.findUnique({
      where: { id: clientId },
      select: { nickname: true, cans: true, sips: true, updatedAt: true },
    });

    const nickChanged = existing ? existing.nickname !== nickname : true;
    if (
      existing &&
      !nickChanged &&
      Date.now() - existing.updatedAt.getTime() < MIN_WRITE_INTERVAL_MS
    ) {
      return NextResponse.json({ ok: true, throttled: true });
    }

    const finalCans = existing ? Math.max(existing.cans, cans) : cans;
    const finalSips = existing ? Math.max(existing.sips, sips) : sips;
    const computedRank = rankName(finalCans);
    const computedBelly = BELLY_NAMES[bellyStage(finalCans)] ?? BELLY_NAMES[0];

    const entry = await prisma.kvasLeaderboardEntry.upsert({
      where: { id: clientId },
      create: {
        id: clientId,
        nickname,
        cans: finalCans,
        sips: finalSips,
        kvasiki,
        rankName: computedRank,
        bellyName: computedBelly,
      },
      update: {
        nickname,
        cans: finalCans,
        sips: finalSips,
        kvasiki,
        rankName: computedRank,
        bellyName: computedBelly,
      },
      select: {
        id: true,
        nickname: true,
        cans: true,
        sips: true,
        kvasiki: true,
        rankName: true,
        bellyName: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, entry });
  } catch (err) {
    console.error('[kvas-leaderboard POST]', err);
    return NextResponse.json({ error: 'Не удалось сохранить результат' }, { status: 500 });
  }
}
