import { MainIntro } from 'src/components/client/MainIntro';
import { NextMatch } from '@/components/client/NextMatch';
import { PreviousMatchesSlider } from '@/components/client/PreviousMatchesSlider';
import { TeamSlider } from '@/components/client/TeamSlider';
import { getMatches, getNextMatch } from '@/services/matches';
import { MY_CLUB_ID } from '@/constants';
import { getPlayers } from '@/services';
import { MyMap } from '@/components/client/Map';

export const revalidate = 1800;

export default async function MainPage() {
  const [nextMatch, matches, players] = await Promise.all([
    getNextMatch(),
    getMatches({ clubId: MY_CLUB_ID, qty: 15 }).then((res) => {
      const dateNow = Date.now();

      return res.matches.filter(
        (match) =>
          new Date(match.date).getTime() <= dateNow && match.score.length > 1
      );
    }),
    getPlayers().then((res) => res.players),
  ]);

  return (
    <>
      <MainIntro />
      {nextMatch && <NextMatch match={nextMatch} />}
      <PreviousMatchesSlider matches={matches} />
      <TeamSlider players={players} />
      <MyMap />
    </>
  );
}
