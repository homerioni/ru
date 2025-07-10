import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';

export async function GET(req: NextRequest) {
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

export async function DELETE(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get('ids');

  const ids = idsParam ? idsParam.split(',').map(Number) : [];

  const response = await prisma.match.deleteMany({
    where: { id: { in: ids } },
  });

  return NextResponse.json(response);
}
