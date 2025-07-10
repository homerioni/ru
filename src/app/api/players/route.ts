import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') || undefined;
  const qty = req.nextUrl.searchParams.get('qty');
  const page = req.nextUrl.searchParams.get('page');

  const takeQty = qty ? +qty : 100;

  const pageNum = page !== null ? +page : undefined;

  const skipQty = pageNum && (pageNum - 1) * takeQty;

  const activePage = skipQty ? skipQty / takeQty + 1 : 1;

  const where = {
    name: {
      contains: search,
      mode: 'insensitive',
    },
  } as const;

  const players = await prisma.player.findMany({
    where,
    orderBy: {
      playedIn: {
        _count: 'desc',
      },
    },
    take: takeQty,
    skip: skipQty,
    include: {
      playedIn: {
        select: {
          goals: true,
          assists: true,
        },
      },
    },
  });

  const totalCount = await prisma.player.count({ where });
  const totalPages = Math.ceil(totalCount / takeQty);

  return NextResponse.json({ players, totalCount, activePage, totalPages });
}

export async function DELETE(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get('ids');

  const ids = idsParam ? idsParam.split(',').map(Number) : [];

  const response = await prisma.player.deleteMany({
    where: { id: { in: ids } },
  });

  return NextResponse.json(response);
}
