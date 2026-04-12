import { getMatches, getNextMatch, getPlayers } from '@/services';
import { getMatchType } from '@/services/matchTypes';
import { NextMatch } from '@/components/client/NextMatch';
import { PreviousMatchesSlider } from '@/components/client/PreviousMatchesSlider';
import { LeagueTable } from '@/components/client/LeagueTable';
import { getTableStats } from '@/utils/getTableStats';
import { TeamSlider } from '@/components/client/TeamSlider';
import s from './styles.module.scss';

const getClubMatchType = (clubId: string) => {
  switch (clubId) {
    case '4':
    case '5':
    case '6':
      return 2;
    case '7':
    case '12':
      return 8;
    default:
      return null;
  }
};

export default async function ClubPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;

  const [nextMatch, matches, players, matchType] = await Promise.all([
    getNextMatch(clubId),
    getMatches({ clubId: +clubId, qty: 15 }).then((res) => {
      const dateNow = Date.now();

      return res.matches.filter(
        (match) =>
          new Date(match.date).getTime() <= dateNow && match.score.length > 1
      );
    }),
    getPlayers({ clubId }).then((res) => res.players),
    getMatchType(getClubMatchType(clubId) ?? 2),
  ]);

  return (
    <div className={s.main}>
      {nextMatch && <NextMatch match={nextMatch} />}
      <PreviousMatchesSlider matches={matches} clubId={+clubId} />
      {getClubMatchType(clubId) && (
        <LeagueTable
          data={getTableStats(matchType)}
          title={matchType.name}
          myClubId={+clubId}
          clubId={clubId}
        />
      )}
      <TeamSlider players={players} clubId={clubId} />
    </div>
  );
}
