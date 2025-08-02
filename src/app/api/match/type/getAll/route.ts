import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../prisma/prisma-client';

export async function GET() {
  const types = await prisma.matchType.findMany({
    include: {
      matches: {
        include: {
          homeClub: true,
          awayClub: true,
          players: {
            include: {
              player: true,
            },
          },
        },
      },
    },
    orderBy: {
      id: 'asc',
    },
  });

  return NextResponse.json(types);
}
