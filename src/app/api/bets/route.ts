import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') || '';

  if (id) {
    const event = await prisma.betEvent.findUnique({
      where: { id: +id },
      include: {
        match: {
          include: {
            awayClub: true,
            homeClub: true,
            type: true,
            players: {
              select: {
                id: true,
                goals: true,
                assists: true,
                player: {
                  select: {
                    name: true,
                    number: true,
                  },
                },
              },
            },
          },
        },
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
    });

    if (event) {
      event.events = event.events.map((e) => ({
        ...e,
        bets: e.bets.sort((a, b) => b.points - a.points).slice(0, 5),
      }));
    }

    return NextResponse.json(event);
  } else {
    const qty = req.nextUrl.searchParams.get('qty');
    const page = req.nextUrl.searchParams.get('page');

    const takeQty = qty ? +qty : 100;

    const pageNum = page !== null ? +page : undefined;

    const skipQty = pageNum && (pageNum - 1) * takeQty;

    const activePage = skipQty ? skipQty / takeQty + 1 : 1;

    const events = await prisma.betEvent.findMany({
      where: {
        isCompleted: false,
      },
      take: takeQty,
      skip: skipQty,
      include: {
        events: true,
        match: {
          include: {
            awayClub: {
              select: {
                id: true,
                logoSrc: true,
              },
            },
            homeClub: {
              select: {
                id: true,
                logoSrc: true,
              },
            },
          },
        },
      },
    });

    const totalCount = await prisma.betEvent.count();
    const totalPages = Math.ceil(totalCount / takeQty);

    return NextResponse.json({
      events,
      totalCount,
      activePage,
      totalPages,
    });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  if (data.id) {
    const event = await prisma.betEvent.update({
      where: { id: data.id },
      data,
    });

    return NextResponse.json(event);
  } else {
    const event = await prisma.betEvent.create({ data });

    return NextResponse.json(event);
  }
}

export async function DELETE(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get('ids');

  const ids = idsParam ? idsParam.split(',').map(Number) : [];

  const response = await prisma.betEvent.deleteMany({
    where: { id: { in: ids } },
  });

  return NextResponse.json(response);
}
