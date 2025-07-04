import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../prisma/prisma-client';
import { getCategory } from '../../../services/categories';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') || undefined;
  const categoryIdParam = req.nextUrl.searchParams.get('category');
  const stock = req.nextUrl.searchParams.get('stock');
  const popular = req.nextUrl.searchParams.get('popular');
  const qty = req.nextUrl.searchParams.get('qty');
  const page = req.nextUrl.searchParams.get('page');

  const categoryId = categoryIdParam !== null ? +categoryIdParam : undefined;
  const isStock = stock === 'true' || (stock === 'false' ? false : undefined);
  const isPopular = popular === 'true' || (popular === 'false' ? false : undefined);
  const takeQty = qty ? +qty : 20;

  const pageNum = page !== null ? +page : undefined;

  const skipQty = pageNum && (pageNum - 1) * takeQty;

  const activePage = skipQty ? skipQty / takeQty + 1 : 1;

  const category = categoryId !== undefined && (await getCategory({ id: categoryId }));
  const categoriesIds = category
    ? category.children.reduce<number[]>(
        (acc, val) => {
          const ids = val.children.map((child) => child.id);
          return [...acc, val.id, ...ids];
        },
        [categoryId]
      )
    : undefined;

  const where = {
    name: {
      contains: search,
      mode: 'insensitive',
    },
    category: {
      id: { in: categoriesIds },
    },
    stock: isStock,
    popular: isPopular,
  } as const;

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: {
      updateAt: 'desc',
    },
    take: takeQty,
    skip: skipQty,
  });

  const totalCount = await prisma.product.count({ where });
  const totalPages = Math.ceil(totalCount / takeQty);

  return NextResponse.json({ products, totalCount, activePage, totalPages });
}

export async function DELETE(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get('ids');

  const ids = idsParam ? idsParam.split(',').map(Number) : [];

  const response = await prisma.product.deleteMany({ where: { id: { in: ids } } });

  return NextResponse.json(response);
}
