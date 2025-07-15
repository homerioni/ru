import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma-client';
import { getIsWin, getCustomExponentialCoefficient } from '@/utils/getIsWin';

export async function POST(req: NextRequest) {
  const id = await req.json();

  const event = await prisma.betEvent.update({
    where: { id },
    data: {
      isCompleted: true,
    },
    include: {
      events: {
        include: {
          bets: {
            include: {
              user: {
                select: {
                  id: true,
                  points: true,
                },
              },
            },
          },
        },
      },
      match: true,
    },
  });

  if (event) {
    const events = event.events
      .map((betOption) =>
        betOption.bets.map((bet) => {
          return () => {
            if (getIsWin(betOption.code, event.match, bet.value)) {
              return prisma.user.update({
                where: { id: bet.userId },
                data: {
                  points: {
                    increment: Math.floor(
                      bet.points *
                        (betOption.ratio.length > 1
                          ? getCustomExponentialCoefficient(
                              betOption.ratio[0] / 100,
                              betOption.ratio[1] / 100,
                              JSON.parse(bet.value as string)
                            )
                          : betOption.ratio[0] / 100)
                    ),
                  },
                },
              });
            }
          };
        })
      )
      .filter((event) => event !== undefined);

    for (const promises of events) {
      await Promise.all(promises?.map((promise) => promise()));
    }
  }

  return NextResponse.json(!!event);
}
