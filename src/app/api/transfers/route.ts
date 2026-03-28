import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';
import { Prisma } from '.prisma/client';
import TransferWhereInput = Prisma.TransferWhereInput;

export async function GET(req: NextRequest) {
  const qty = req.nextUrl.searchParams.get('qty');
  const page = req.nextUrl.searchParams.get('page');
  const clubId = req.nextUrl.searchParams.get('clubId');
  const clubAdminId = req.nextUrl.searchParams.get('clubAdminId');

  const takeQty = qty ? +qty : 100;

  const pageNum = page !== null ? +page : undefined;

  const skipQty = pageNum && (pageNum - 1) * takeQty;

  const activePage = skipQty ? skipQty / takeQty + 1 : 1;

  const where: TransferWhereInput & { clubAdminId?: number } = {};

  if (clubId) {
    where.OR = [{ fromClubId: +clubId }, { toClubId: +clubId }];
  }

  if (clubAdminId) {
    where.clubAdminId = +clubAdminId;
  }

  const transfers = await prisma.transfer.findMany({
    where,
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

  const totalCount = await prisma.transfer.count({ where });
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
    const transferDate = new Date(data.date);

    const startOfDay = new Date(transferDate);
    startOfDay.setDate(1);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(
      new Date(transferDate).getFullYear(),
      new Date(transferDate).getMonth() + 1,
      0
    );
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingTransfer = await prisma.transfer.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        playerId: data.playerId,
      },
    });

    if (existingTransfer) {
      return NextResponse.json(
        { error: 'Трансфер этого игрока уже есть в этом месяце' },
        { status: 409 }
      );
    }

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
