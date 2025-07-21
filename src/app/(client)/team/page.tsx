import img from 'src/assets/img/team.jpg';
import { Team } from '@/components/client/Team';
import { Intro } from '@/components/client/Intro';
import { getPlayers } from '@/services';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Игроки | Речичане United',
  description: 'Список игроков клуба Речичане United',
};

export default async function TeamPage() {
  const { players } = await getPlayers();

  return (
    <>
      <Intro imgSrc={img.src} alt={'Состав'} title={'Состав нашей команды'} />
      <Team players={players} />
    </>
  );
}
