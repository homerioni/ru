import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') || '';

  if (id) {
    const type = await prisma.matchType.findUnique({
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

    return NextResponse.json(type);
  } else {
    const search = req.nextUrl.searchParams.get('search') || undefined;

    const where = {
      name: {
        contains: search,
        mode: 'insensitive',
      },
    } as const;

    const types = await prisma.matchType.findMany({ where });

    return NextResponse.json(types);
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  if (data.id) {
    const type = await prisma.matchType.update({
      where: { id: data.id },
      data,
    });

    return NextResponse.json(type);
  } else {
    const type = await prisma.matchType.create({ data });

    return NextResponse.json(type);
  }
}

export async function DELETE(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get('ids');

  const ids = idsParam ? idsParam.split(',').map(Number) : [];

  const response = await prisma.matchType.deleteMany({
    where: { id: { in: ids } },
  });

  return NextResponse.json(response);
}
