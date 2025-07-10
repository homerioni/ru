import { NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';
import { MY_CLUB_ID } from '@/constants';

export async function GET() {
  const match = await prisma.match.findFirst({
    where: {
      date: {
        gt: new Date(),
      },
      OR: [{ homeClubId: MY_CLUB_ID }, { awayClubId: MY_CLUB_ID }],
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
