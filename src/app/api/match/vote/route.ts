import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';

export async function POST(req: NextRequest) {
  const data = await req.json();

  const match = await prisma.matchVote.create({ data });

  return NextResponse.json(match);
}
