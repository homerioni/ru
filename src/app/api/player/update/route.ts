import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';
import { withClubAdminRequestLog } from '@/lib/clubAdminRequestLogger';

export async function POST(req: NextRequest) {
  return withClubAdminRequestLog(req, async () => {
    const data = await req.json();

    const player = await prisma.player.update({
      where: { id: data.id },
      data,
    });

    return NextResponse.json(player);
  });
}
