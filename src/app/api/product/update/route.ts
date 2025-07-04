import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@prisma/client';
import { prisma } from '../../../../../prisma/prisma-client';

export async function POST(req: NextRequest) {
  const data: Product & { category: unknown } = await req.json();

  const updateData = {
    name: data.name,
    linkName: data.linkName,
    categoryId: data.categoryId,
    stock: data.stock,
    description: data.description,
    fullPrice: data.fullPrice,
    price: data.price,
    imageUrl: data.imageUrl,
    popular: data.popular,
  };

  const product = await prisma.product.update({
    where: { id: data.id },
    data: updateData,
  });

  return NextResponse.json(product);
}
