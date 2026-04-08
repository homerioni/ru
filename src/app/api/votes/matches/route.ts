import { NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';

export async function GET() {
  const matches = await prisma.match.findMany({
    where: {
      voteStatus: 'started',
    },
    orderBy: {
      date: 'desc',
    },
    include: {
      awayClub: true,
      homeClub: true,
      type: true,
    },
  });

  return NextResponse.json(matches);
}
