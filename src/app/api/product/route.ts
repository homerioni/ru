import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';
import { CreateProductData } from '../../../types';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') || '';

  const product = await prisma.product.findUnique({ where: { id: +id } });

  return NextResponse.json(product);
}

export async function POST(req: NextRequest) {
  const data: CreateProductData = await req.json();

  const newProduct = await prisma.product.create({ data });

  const product = await prisma.product.update({
    where: { id: newProduct.id },
    data: { linkName: `${newProduct.linkName}-${newProduct.id}` },
  });

  return NextResponse.json(product);
}
