import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';

export async function GET(req: NextRequest) {
  const qty = req.nextUrl.searchParams.get('qty');
  const page = req.nextUrl.searchParams.get('page');

  const takeQty = qty ? +qty : 100;

  const pageNum = page !== null ? +page : undefined;

  const skipQty = pageNum && (pageNum - 1) * takeQty;

  const activePage = skipQty ? skipQty / takeQty + 1 : 1;

  const players = await prisma.player.findMany({
    orderBy: {
      updateAt: 'desc',
    },
    take: takeQty,
    skip: skipQty,
  });

  const totalCount = await prisma.player.count();
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
