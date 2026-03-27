import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';

export async function GET(req: NextRequest) {
  const qty = req.nextUrl.searchParams.get('qty');
  const page = req.nextUrl.searchParams.get('page');
  const clubId = req.nextUrl.searchParams.get('clubId');

  const takeQty = qty ? +qty : 100;

  const pageNum = page !== null ? +page : undefined;

  const skipQty = pageNum && (pageNum - 1) * takeQty;

  const activePage = skipQty ? skipQty / takeQty + 1 : 1;

  const whereClubId = clubId
    ? { OR: [{ fromClubId: +clubId }, { toClubId: +clubId }] }
    : {};

  const transfers = await prisma.transfer.findMany({
    where: whereClubId,
    orderBy: {
      updateAt: 'desc',
    },
    take: takeQty,
    skip: skipQty,
    include: {
      player: true,
      fromClub: true,
      toClub: true,
    },
  });

  const totalCount = await prisma.transfer.count({ where: whereClubId });
  const totalPages = Math.ceil(totalCount / takeQty);

  return NextResponse.json({ transfers, totalCount, activePage, totalPages });
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  if (data.id) {
    const transfer = await prisma.transfer.update({
      where: { id: data.id },
      data,
    });

    return NextResponse.json(transfer);
  } else {
    const transfer = await prisma.transfer.create({ data });

    return NextResponse.json(transfer);
  }
}

export async function DELETE(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get('ids');

  const ids = idsParam ? idsParam.split(',').map(Number) : [];

  const response = await prisma.transfer.deleteMany({
    where: { id: { in: ids } },
  });

  return NextResponse.json(response);
}
