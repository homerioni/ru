import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';

export async function GET(req: NextRequest) {
  const linkName = req.nextUrl.searchParams.get('linkName') ?? undefined;
  const reqId = req.nextUrl.searchParams.get('id');
  const id = reqId ? +reqId : undefined;

  const category = await prisma.category.findUnique({
    where: {
      id,
      linkName,
    },
    include: {
      children: {
        include: {
          children: {
            include: {
              children: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(category);
}
