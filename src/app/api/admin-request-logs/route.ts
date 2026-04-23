import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';

export async function GET(req: NextRequest) {
  const qty = req.nextUrl.searchParams.get('qty');
  const page = req.nextUrl.searchParams.get('page');
  const search = req.nextUrl.searchParams.get('search') || undefined;

  const takeQty = qty ? +qty : 50;
  const pageNum = page !== null ? +page : 1;
  const skipQty = (pageNum - 1) * takeQty;

  const where = search
    ? {
        OR: [
          { path: { contains: search, mode: 'insensitive' as const } },
          { method: { contains: search, mode: 'insensitive' as const } },
          { adminUsername: { contains: search, mode: 'insensitive' as const } },
          { payload: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : undefined;

  const logs = await prisma.clubAdminRequestLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: takeQty,
    skip: skipQty,
  });

  const totalCount = await prisma.clubAdminRequestLog.count({ where });
  const totalPages = Math.ceil(totalCount / takeQty);

  return NextResponse.json({
    logs,
    totalCount,
    activePage: pageNum,
    totalPages,
  });
}
