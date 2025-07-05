import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => new PrismaClient();

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

prisma.$use(async (params, next) => {
  // Логика для обработки MatchPlayer (обновление счетчика матчей)
  if (params.model === 'MatchPlayer' && params.action === 'create') {
    const playerId = params.args.data.playerId;

    const matchCount = await prisma.matchPlayer.count({
      where: { playerId },
    });

    await prisma.player.update({
      where: { id: playerId },
      data: { matches: matchCount },
    });
  }

  // Логика для обработки MatchEvent (голы/ассисты)
  if (params.model === 'MatchEvent' && params.action === 'create') {
    const { playerId, type } = params.args.data;

    await prisma.player.update({
      where: { id: playerId },
      data: {
        [type === 'GOAL' ? 'goals' : 'assists']: { increment: 1 },
      },
    });
  }

  return next(params);
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
