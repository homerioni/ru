import { TGetMatch } from '@/services';
import { useState } from 'react';
import s from './styles.module.scss';
import { MatchesCupListItem } from '@/components/client/MatchesCupList/MatchesCupListItem';
import { Club, MatchType } from '@prisma/client';
import { TMatchNotType } from '@/app/(layout)/(client)/tables/page';

const getRoundTitle = (round: string) => {
  if (round.startsWith('group')) {
    return `Группа ${round.slice(6).toUpperCase()}`;
  }

  switch (round) {
    case '1':
      return 'Финал';
    case '2':
      return 'Полуфинал';
    case '3':
      return '3-е место';
    default:
      return `1/${round} финала`;
  }
};

export const MatchesCupList = ({
  matches,
  type,
}: {
  matches: TMatchNotType[];
  type: MatchType & { clubs: Club[] };
}) => {
  const [collapsedRounds, setCollapsedRounds] = useState<
    Record<string, boolean>
  >({});

  const toggleRound = (round: string) => {
    setCollapsedRounds((prev) => ({
      ...prev,
      [round]: !prev[round],
    }));
  };

  const MatchList = matches.reduce(
    (acc, match) => {
      if (!match.round) {
        return acc;
      }

      if (!acc[match.round]) {
        acc[match.round] = [];
      }

      acc[match.round].push({ ...match, type, votes: [] });

      return acc;
    },
    {} as Record<string, TGetMatch[]>
  );

  return (
    <div className={s.wrapper}>
      {Object.entries(MatchList)
        .sort((a, b) => {
          if (a[0].startsWith('group')) {
            return 1;
          }

          if (a[0] === '3' && b[0] === '2') {
            return -1;
          }

          return +a[0] - +b[0];
        })
        .map(([round, matchList]) => {
          const isCollapsed = collapsedRounds[round] || false;

          return (
            <MatchesCupListItem
              key={round}
              round={round}
              toggleRound={() => toggleRound(round)}
              isCollapsed={isCollapsed}
              roundTitle={getRoundTitle(round)}
              matchList={matchList}
              type={type}
            />
          );
        })}
    </div>
  );
};
