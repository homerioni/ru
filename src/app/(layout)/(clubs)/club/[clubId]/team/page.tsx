import { Team } from '@/components/client/Team';
import { getPlayers, getTransfers } from '@/services';
import { getMatchTypes } from '@/services/matchTypes';
import { BackLink } from '@ui/BackLink';
import s from './styles.module.scss';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Игроки | Речичане United',
  description: 'Список игроков клуба Речичане United',
};

export default async function TeamPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;

  const [players, matchTypes, transfers] = await Promise.all([
    getPlayers({ clubId }).then((res) => res.players),
    getMatchTypes(),
    getTransfers({ clubId: +clubId }).then((res) => res.transfers),
  ]);

  return (
    <>
      <div className={s.backLink}>
        <BackLink href={`/club/${clubId}`} />
      </div>
      <Team
        players={players}
        matchTypes={matchTypes}
        transfers={transfers}
        clubId={+clubId}
      />
    </>
  );
}
