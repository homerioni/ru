import { LiveBroadcast } from '@prisma/client';
import { prisma } from '../../prisma/prisma-client';

export async function getActiveBroadcast(): Promise<LiveBroadcast | null> {
  try {
    return await prisma.liveBroadcast.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
  } catch {
    return null;
  }
}
