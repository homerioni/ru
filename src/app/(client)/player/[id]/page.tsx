import { getPlayer } from '@/services';
import { redirect } from 'next/navigation';
import { TeamCard } from '@/components/client/TeamCard';
import s from './styles.module.scss';
import { PlayerStatsList } from '@/components/client/PlayerStatsList';
import { AwardList } from '@/components/client/AwardList';
import { PlayerEdit } from '@/components/client/PlayerEdit';

export const dynamic = 'force-dynamic';

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const player = await getPlayer(id);

  if (!player) {
    redirect('/');
  }

  const { goals, assists } = player.playedIn.reduce(
    (item, acc) => {
      return {
        goals: acc.goals + item.goals,
        assists: acc.assists + item.assists,
      };
    },
    {
      goals: 0,
      assists: 0,
    }
  );

  return (
    <div className={s.main}>
      <PlayerEdit username={player.username} playerData={player} />
      <TeamCard
        name={player.name}
        position={player.position}
        isTeam={player.type === 'team'}
        matches={player.playedIn.length}
        goals={goals}
        assists={assists}
        photo={player.photo}
        number={player.number}
        club={player.club}
      />
      <AwardList data={player.awards ?? []} />
      <PlayerStatsList playedIn={player.playedIn} />
    </div>
  );
}
