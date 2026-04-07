import { Matches } from '@/components/client/Matches';
import { getMatches } from '@/services';
import { MY_CLUB_ID } from '@/constants';
import s from './styles.module.scss';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Матчи | Речичане United',
  description: 'Список будущих и сыгранных матчей команды Речичане United',
};

export default async function MatchesPage() {
  const { matches } = await getMatches({ clubId: MY_CLUB_ID });

  return (
    <section className={s.main}>
      <Matches matches={matches} clubId={MY_CLUB_ID} />
    </section>
  );
}
