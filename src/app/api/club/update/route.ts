import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';

export async function POST(req: NextRequest) {
  const data = await req.json();

  const club = await prisma.club.update({
    where: { id: data.id },
    data,
  });

  return NextResponse.json(club);
}
