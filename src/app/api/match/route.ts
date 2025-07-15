import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') || '';

  if (id) {
    const match = await prisma.match.findUnique({
      where: { id: +id },
      include: {
        awayClub: true,
        homeClub: true,
        players: {
          include: {
            player: true,
          },
        },
        type: true,
        betEvent: {
          include: {
            events: {
              include: {
                bets: {
                  include: {
                    user: {
                      select: {
                        name: true,
                        image: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (match?.betEvent) {
      match.betEvent.events = match.betEvent.events.map((e) => ({
        ...e,
        bets: e.bets.sort((a, b) => b.points - a.points),
      }));
    }

    return NextResponse.json(match);
  } else {
    const qty = req.nextUrl.searchParams.get('qty');
    const page = req.nextUrl.searchParams.get('page');
    const typeId = req.nextUrl.searchParams.get('typeId');
    const clubId = req.nextUrl.searchParams.get('clubId');

    const takeQty = qty ? +qty : 100;

    const pageNum = page !== null ? +page : undefined;

    const skipQty = pageNum && (pageNum - 1) * takeQty;

    const activePage = skipQty ? skipQty / takeQty + 1 : 1;

    const whereTypeId = typeId ? { typeId: +typeId } : {};

    const whereClubId = clubId
      ? { OR: [{ homeClubId: +clubId }, { awayClubId: +clubId }] }
      : {};

    const matches = await prisma.match.findMany({
      where: {
        ...whereTypeId,
        ...whereClubId,
      },
      orderBy: {
        date: 'desc',
      },
      take: takeQty,
      skip: skipQty,
      include: {
        awayClub: true,
        homeClub: true,
        type: true,
        players: {
          select: {
            id: true,
            goals: true,
            assists: true,
            playerId: true,
            matchId: true,
            player: {
              select: {
                name: true,
                number: true,
              },
            },
          },
        },
      },
    });

    const totalCount = await prisma.match.count();
    const totalPages = Math.ceil(totalCount / takeQty);

    return NextResponse.json({ matches, totalCount, activePage, totalPages });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  if (data.id) {
    const match = await prisma.match.update({
      where: { id: data.id },
      data,
    });

    return NextResponse.json(match);
  } else {
    const match = await prisma.match.create({ data });

    return NextResponse.json(match);
  }
}

export async function DELETE(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get('ids');

  const ids = idsParam ? idsParam.split(',').map(Number) : [];

  const response = await prisma.match.deleteMany({
    where: { id: { in: ids } },
  });

  return NextResponse.json(response);
}
