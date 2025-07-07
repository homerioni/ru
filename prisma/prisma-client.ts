import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => new PrismaClient();

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

prisma.$use(async (params, next) => {
  // if (params.model === 'Match' && params.action === 'create') {
  //   const data = params.args.data as Match;
  //
  //   console.log(data);
  //
  // const matchCount = await prisma.matchPlayer.count({
  //   where: { playerId: data.playerId },
  // });
  //
  // const statsAggregate = await prisma.matchPlayer.aggregate({
  //   where: { playerId: data.playerId },
  //   _sum: { goals: true, assists: true },
  // });
  //
  // console.log('data', data);
  // console.log('statsAggregate', statsAggregate);
  // console.log('matchCount', matchCount);
  //
  // await prisma.player.update({
  //   where: { id: data.playerId },
  //   data: {
  //     matches: matchCount + 1,
  //     goals: (statsAggregate._sum?.goals || 0) + data.goals,
  //     assists: (statsAggregate._sum?.assists || 0) + data.assists,
  //   },
  // });
  // } else if (params.model === 'Match' && params.action === 'update') {
  // const where = params.args.where as { id: number };
  // const data = params.args.data as Partial<MatchPlayer>;
  //
  // if (data.goals !== undefined || data.assists !== undefined) {
  //   const currentMatchPlayer = await prisma.matchPlayer.findUnique({
  //     where: { id: where.id },
  //   });
  //
  //   if (currentMatchPlayer) {
  //     const statsAggregate = await prisma.matchPlayer.aggregate({
  //       where: {
  //         playerId: data.playerId,
  //         NOT: { id: where.id },
  //       },
  //       _sum: {
  //         goals: true,
  //         assists: true,
  //       },
  //     });
  //
  //     await prisma.player.update({
  //       where: { id: data.playerId },
  //       data: {
  //         goals:
  //           (statsAggregate._sum?.goals || 0) +
  //           (data.goals !== undefined
  //             ? data.goals
  //             : currentMatchPlayer.goals),
  //         assists:
  //           (statsAggregate._sum?.assists || 0) +
  //           (data.assists !== undefined
  //             ? data.assists
  //             : currentMatchPlayer.assists),
  //       },
  //     });
  //   }
  // }
  // } else if (params.model === 'Match' && params.action === 'deleteMany') {
  //   const ids = params.args.where.id.in as number[];
  //
  // const where = params.args.where as { id: number };
  //
  // const deletedMatchPlayer = await prisma.matchPlayer.findUnique({
  //   where: { id: where.id },
  // });
  //
  // if (deletedMatchPlayer) {
  //   const statsAggregate = await prisma.matchPlayer.aggregate({
  //     where: {
  //       playerId: deletedMatchPlayer.playerId,
  //       NOT: { id: where.id },
  //     },
  //     _sum: {
  //       goals: true,
  //       assists: true,
  //     },
  //   });
  //
  //   const matchCount = await prisma.matchPlayer.count({
  //     where: {
  //       playerId: deletedMatchPlayer.playerId,
  //       NOT: { id: where.id },
  //     },
  //   });
  //
  //   await prisma.player.update({
  //     where: { id: deletedMatchPlayer.playerId },
  //     data: {
  //       matches: matchCount,
  //       goals: statsAggregate._sum?.goals || 0,
  //       assists: statsAggregate._sum?.assists || 0,
  //     },
  //   });
  // }
  // }

  return next(params);
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
