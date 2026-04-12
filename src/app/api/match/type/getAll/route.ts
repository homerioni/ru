import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../prisma/prisma-client';

export async function GET(req: NextRequest) {
  const clubId = req.nextUrl.searchParams.get('clubId') || '';

  const where = clubId
    ? {
        clubs: {
          some: {
            id: +clubId,
          },
        },
      }
    : undefined;

  const types = await prisma.matchType.findMany({
    where,
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
      clubs: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  return NextResponse.json(types);
}
