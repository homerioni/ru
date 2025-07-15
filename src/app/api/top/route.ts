import { NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';

export async function GET() {
  const users = await prisma.user.findMany({
    take: 10,
    select: { points: true, name: true, image: true },
    orderBy: { points: 'desc' },
  });

  return NextResponse.json(users);
}
