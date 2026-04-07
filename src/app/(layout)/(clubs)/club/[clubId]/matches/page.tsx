import { Matches } from '@/components/client/Matches';
import { getMatches } from '@/services';
import s from './styles.module.scss';
import { BackLink } from '@ui/BackLink';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Матчи | Речичане United',
  description: 'Список будущих и сыгранных матчей команды Речичане United',
};

export default async function MatchesPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;

  const { matches } = await getMatches({ clubId: +clubId });

  return (
    <section className={s.main}>
      <div className={s.backLink}>
        <BackLink href={`/club/${clubId}`} />
      </div>
      <Matches matches={matches} clubId={clubId} />
    </section>
  );
}
