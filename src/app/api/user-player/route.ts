import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username') || '';

  const player = await prisma.player.findFirst({
    where: { username: username },
  });

  return NextResponse.json(player);
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const player = await prisma.player.create({ data });

  return NextResponse.json(player);
}
