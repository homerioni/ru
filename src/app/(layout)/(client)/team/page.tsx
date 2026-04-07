import { Team } from '@/components/client/Team';
import { getPlayers, getTransfers } from '@/services';
import { getMatchTypes } from '@/services/matchTypes';
import { MY_CLUB_ID } from '@/constants';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Игроки | Речичане United',
  description: 'Список игроков клуба Речичане United',
};

export default async function TeamPage() {
  const [players, matchTypes, transfers] = await Promise.all([
    getPlayers({ clubId: String(MY_CLUB_ID) }).then((res) => res.players),
    getMatchTypes(),
    getTransfers({ clubId: MY_CLUB_ID }).then((res) => res.transfers),
  ]);

  return (
    <>
      <Team players={players} matchTypes={matchTypes} transfers={transfers} />
    </>
  );
}
