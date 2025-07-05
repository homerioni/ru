import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') || '';

  const club = await prisma.club.findUnique({ where: { id: +id } });

  return NextResponse.json(club);
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const club = await prisma.club.create({ data });

  return NextResponse.json(club);
}
