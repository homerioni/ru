import { MainIntro } from '@/components/client/MainIntro';
import { NextMatch } from '@/components/client/NextMatch';
import { PreviousMatchesSlider } from '@/components/client/PreviousMatchesSlider';
import { TeamSlider } from '@/components/client/TeamSlider';
import { getMatches, getNextMatch } from '@/services/matches';
import { MY_CLUB_ID } from '@/constants';
import { getPlayers } from '@/services';
import { MyMap } from '@/components/client/Map';
import { getMatchType } from '@/services/matchTypes';
import { LeagueTable } from '@/components/client/LeagueTable';
import { getTableStats } from '@/utils/getTableStats';

export const revalidate = 1800;

export default async function MainPage() {
  const [nextMatch, matches, players, matchType] = await Promise.all([
    getNextMatch(),
    getMatches({ clubId: MY_CLUB_ID, qty: 15 }).then((res) => {
      const dateNow = Date.now();

      return res.matches.filter(
        (match) =>
          new Date(match.date).getTime() <= dateNow && match.score.length > 1
      );
    }),
    getPlayers({ clubId: String(MY_CLUB_ID) }).then((res) => res.players),
    getMatchType(2),
  ]);

  return (
    <>
      <MainIntro />
      {nextMatch && <NextMatch match={nextMatch} />}
      <PreviousMatchesSlider matches={matches} clubId={MY_CLUB_ID} />
      <LeagueTable
        data={getTableStats(matchType)}
        title={matchType.name}
        myClubId={MY_CLUB_ID}
      />
      <TeamSlider players={players} />
      <MyMap />
    </>
  );
}
