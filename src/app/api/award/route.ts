import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';
import { withClubAdminRequestLog } from '@/lib/clubAdminRequestLogger';

export async function POST(req: NextRequest) {
  return withClubAdminRequestLog(req, async () => {
    const data = await req.json();

    const player = await prisma.player.findUnique({
      where: { id: data.playerId },
    });

    if (!player) {
      throw new Error('Player not found');
    }

    const club = await prisma.club.findUnique({
      where: { id: player.clubId ?? 0 },
    });

    if (!club) {
      throw new Error('Club not found');
    }

    const award = await prisma.award.create({
      data: { ...data, clubName: club.name, clubImgSrc: club.logoSrc },
    });

    return NextResponse.json(award);
  });
}
