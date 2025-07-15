import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';

export async function POST(req: NextRequest) {
  const data = await req.json();

  const points = await prisma.user
    .findUnique({
      where: { id: data.userId },
      select: {
        points: true,
      },
    })
    .then((res) => res?.points);

  if (points && points >= data.points) {
    const bet = await prisma.userBet.create({ data });

    if (bet) {
      await prisma.user.update({
        where: { id: data.userId },
        data: { points: points - data.points },
      });
    }

    return NextResponse.json(bet);
  }

  return NextResponse.json(false);
}
