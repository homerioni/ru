import img from 'src/assets/img/team.jpg';
import { Team } from '@/components/client/Team';
import { Intro } from '@/components/client/Intro';
import { getPlayers } from '@/services';

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const players = await getPlayers().then((res) =>
    res.players.sort((a, b) => b.playedIn.length - a.playedIn.length)
  );

  return (
    <>
      <Intro imgSrc={img.src} alt={'Состав'} title={'Состав нашей команды'} />
      <Team players={players} />
    </>
  );
}
