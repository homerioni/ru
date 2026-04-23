import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';
import { withClubAdminRequestLog } from '@/lib/clubAdminRequestLogger';

export async function GET(req: NextRequest) {
  return withClubAdminRequestLog(req, async () => {
    const id = req.nextUrl.searchParams.get('id') || '';

    const club = await prisma.club.findUnique({ where: { id: +id } });

    return NextResponse.json(club);
  });
}

export async function POST(req: NextRequest) {
  return withClubAdminRequestLog(req, async () => {
    const data = await req.json();

    const club = await prisma.club.create({ data });

    return NextResponse.json(club);
  });
}
