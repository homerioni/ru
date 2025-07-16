import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';
import { BetInfo } from '@/services/bets';

export async function POST(req: NextRequest) {
  const data = (await req.json()) as BetInfo[];

  if (data?.length) {
    for (const bet of data) {
      await prisma.user.update({
        where: { id: bet.userId },
        data: { points: { increment: bet.points } },
      });
    }
  }

  return NextResponse.json(true);
}
