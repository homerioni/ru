import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') || undefined;

  const where = {
    name: {
      contains: search,
      mode: 'insensitive',
    },
  } as const;

  const matchTypes = await prisma.matchType.findMany({ where });

  return NextResponse.json(matchTypes);
}

export async function DELETE(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get('ids');

  const ids = idsParam ? idsParam.split(',').map(Number) : [];

  const response = await prisma.matchType.deleteMany({
    where: { id: { in: ids } },
  });

  return NextResponse.json(response);
}
