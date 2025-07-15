import { NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';

export async function GET() {
  const match = await prisma.match.findMany({
    where: {
      date: {
        gt: new Date(),
      },
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
