import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/prisma-client';

type GetClubPhotosOptions = {
  all?: boolean;
};

export async function getClubPhotosFromDb(
  clubId: number,
  { all = false }: GetClubPhotosOptions = {}
) {
  try {
    return await prisma.clubPhoto.findMany({
      where: {
        clubId,
        ...(all ? {} : { isPublished: true }),
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2021'
    ) {
      return [];
    }

    throw error;
  }
}
