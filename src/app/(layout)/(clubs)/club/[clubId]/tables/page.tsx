import { GamesTableWrapper } from '@/components/client/GamesTableWrapper';
import { getAllMatchesTypes } from '@/services/matchTypes';
import { Club, Match, MatchType } from '@prisma/client';
import { TGetMatch } from '@/services/matches';
import { getTableStats } from '@/utils/getTableStats';
import s from './styles.module.scss';
import { BackLink } from '@ui/BackLink';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Турниры | Речичане United',
  description: 'Турниры',
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

export type TMatchNotType = Omit<TGetMatch, 'type' | 'votes'>;

export type TMatchGroups = {
  types: { id: number; name: string; year: number | null }[];
} & {
  [id: number]: {
    type: MatchType & { clubs: Club[] };
    matches?: {
      played: TMatchNotType[];
      future: TMatchNotType[];
    };
    table?: ClubStats[];
  };
};

export default async function TablesPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;

  const matches = await getAllMatchesTypes(clubId).then((res) => {
    const groupedMatches: TMatchGroups = {
      types: [],
    };

    res.forEach((type) => {
      if (type.isArchive) {
        return;
      }

      groupedMatches.types.push({
        id: type.id,
        name: type.name,
        year: type.year,
      });

      groupedMatches[type.id] = {
        type: {
          id: type.id,
          name: type.name,
          fullName: type.fullName,
          year: type.year,
          type: type.type,
          isArchive: type.isArchive,
          clubs: type.clubs,
        },
      };

      groupedMatches[type.id].matches = type.matches.reduce<{
        played: TMatchNotType[];
        future: TMatchNotType[];
      }>(
        (acc, item) => {
          const matchKey = item.score.length ? 'played' : 'future';

          acc[matchKey].push(item);

          return acc;
        },
        { played: [], future: [] }
      );

      if (!type.clubs?.length || type.type === 'any') {
        return;
      }

      if (type.type === 'league') {
        groupedMatches[type.id].table = getTableStats(type);
      }
    });

    return groupedMatches;
  });

  return (
    <>
      <div className={s.backLink}>
        <BackLink href={`/club/${clubId}`} />
      </div>
      <GamesTableWrapper matches={matches} myClubId={+clubId} />
    </>
  );
}
