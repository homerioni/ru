import { GamesTableWrapper } from '@/components/client/GamesTableWrapper';
import { getAllMatchesTypes } from '@/services/matchTypes';
import { Club, Match, MatchType } from '@prisma/client';
import { TGetMatch } from '@/services/matches';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Турниры | Речичане United',
  description: 'Турниры в которых учавствует клуб Речичане United',
};

export type ClubStats = {
  club: Club;
  matches: Match[];
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals: number;
  missed: number;
  goalDifference: number;
  points: number;
};

export type TMatchNotType = Omit<TGetMatch, 'type'>;

export type TMatchGroups = {
  types: { id: number; name: string }[];
} & {
  [id: number]: {
    type: MatchType;
    matches?: {
      played: TMatchNotType[][];
      future: TMatchNotType[][];
    };
    table?: ClubStats[];
  };
};

export default async function TablesPage() {
  const matches = await getAllMatchesTypes().then((res) => {
    const groupedMatches: TMatchGroups = {
      types: [],
    };

    res.forEach((type) => {
      groupedMatches.types.push({ id: type.id, name: type.name });

      groupedMatches[type.id] = {
        type: {
          id: type.id,
          name: type.name,
          fullName: type.fullName,
          year: type.year,
          isLeague: type.isLeague,
          isArchive: type.isArchive,
        },
      };

      groupedMatches[type.id].matches = type.matches.reduce<{
        played: TMatchNotType[][];
        future: TMatchNotType[][];
      }>(
        (acc, item) => {
          const matchKey = item.score.length ? 'played' : 'future';

          if (item.round) {
            if (acc[matchKey][item.round]) {
              acc[matchKey][item.round].push(item);
            } else {
              acc[matchKey][item.round] = [item];
            }
          } else {
            if (acc[matchKey][0]) {
              acc[matchKey][0].push(item);
            } else {
              acc[matchKey][0] = [item];
            }
          }

          return acc;
        },
        { played: [], future: [] }
      );

      if (type.isLeague) {
        const clubMap = new Map<number, ClubStats>();

        for (const match of type.matches) {
          const { homeClub, awayClub, score } = match;

          if (!score || score.length !== 2) continue;

          const [homeGoals, awayGoals] = score;

          for (const [club, isHome] of [
            [homeClub, true],
            [awayClub, false],
          ] as const) {
            if (!clubMap.has(club.id)) {
              clubMap.set(club.id, {
                club,
                matches: [],
                played: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                goals: 0,
                missed: 0,
                goalDifference: 0,
                points: 0,
              });
            }

            const stats = clubMap.get(club.id)!;

            stats.matches.push(match);
            stats.played += 1;

            const isWin =
              (isHome && homeGoals > awayGoals) ||
              (!isHome && awayGoals > homeGoals);
            const isDraw = homeGoals === awayGoals;

            if (isWin) {
              stats.wins += 1;
              stats.points += 3;
            } else if (isDraw) {
              stats.draws += 1;
              stats.points += 1;
            } else {
              stats.losses += 1;
            }

            const goalsFor = isHome ? homeGoals : awayGoals;
            const goalsAgainst = isHome ? awayGoals : homeGoals;

            stats.goals += goalsFor;
            stats.missed += goalsAgainst;
            stats.goalDifference = stats.goals - stats.missed;
          }
        }

        const clubsWithStats = Array.from(clubMap.values());

        clubsWithStats.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return b.goalDifference - a.goalDifference;
        });

        groupedMatches[type.id].table = clubsWithStats;
      }
    });

    return groupedMatches;
  });

  return <GamesTableWrapper matches={matches} />;
}
