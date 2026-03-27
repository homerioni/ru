import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';
import { MY_CLUB_ID } from '@/constants';

export async function GET(req: NextRequest) {
  const clubId = req.nextUrl.searchParams.get('id');

  const match = await prisma.match.findFirst({
    where: {
      date: {
        gt: new Date(),
      },
      OR: [
        { homeClubId: +(clubId ?? MY_CLUB_ID) },
        { awayClubId: +(clubId ?? MY_CLUB_ID) },
      ],
    },
    orderBy: {
      date: 'asc',
    },
    include: {
      homeClub: true,
      awayClub: true,
      type: true,
    },
  });

  return NextResponse.json(match);
}
