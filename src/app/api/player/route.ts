import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') || '';

  const player = await prisma.player.findUnique({ where: { id: +id } });

  return NextResponse.json(player);
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const player = await prisma.player.create({ data });

  return NextResponse.json(player);
}
