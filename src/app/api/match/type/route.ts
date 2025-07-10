import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') || '';

  const match = await prisma.matchType.findUnique({
    where: { id: +id },
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
  });

  return NextResponse.json(match);
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const match = await prisma.matchType.create({ data });

  return NextResponse.json(match);
}
