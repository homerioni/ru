import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';

const DAYS_IN_MONTH = 30;

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status');
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - DAYS_IN_MONTH);

  const matches = await prisma.match.findMany({
    where: {
      ...(status === 'closedRecent'
        ? {
            voteStatus: 'closed',
            voteStartDate: {
              gte: monthAgo,
            },
          }
        : {
            voteStatus: 'started',
          }),
    },
    orderBy: {
      date: 'desc',
    },
    include: {
      awayClub: true,
      homeClub: true,
      type: true,
    },
  });

  return NextResponse.json(matches);
}
