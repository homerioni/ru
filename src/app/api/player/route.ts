import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';
import { withClubAdminRequestLog } from '@/lib/clubAdminRequestLogger';

export async function GET(req: NextRequest) {
  return withClubAdminRequestLog(req, async () => {
    const id = req.nextUrl.searchParams.get('id') || '';

    const player = await prisma.player.findUnique({
      where: { id: +id },
      include: {
        club: true,
        playedIn: {
          include: { match: { include: { type: true } } },
        },
        transfers: true,
        awards: true,
      },
    });

    return NextResponse.json(player);
  });
}

export async function POST(req: NextRequest) {
  return withClubAdminRequestLog(req, async () => {
    const data = await req.json();

    const player = await prisma.player.create({ data });

    return NextResponse.json(player);
  });
}
