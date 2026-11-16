import { getPlayer } from '@/services';
import { redirect } from 'next/navigation';
import { TeamCard } from '@/components/client/TeamCard';
import s from './styles.module.scss';
import { PlayerStatsList } from '@/components/client/PlayerStatsList';
import { AwardList } from '@/components/client/AwardList';
import { PlayerEdit } from '@/components/client/PlayerEdit';

export const dynamic = 'force-dynamic';

const toPerGame = (value: number, matches: number) =>
  matches > 0 ? Number((value / matches).toFixed(2)) : 0;

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

  const matches = player.playedIn.length;
  const { goals, assists } = player.playedIn.reduce(
    (acc, item) => ({
      goals: acc.goals + item.goals,
      assists: acc.assists + item.assists,
    }),
    {
      goals: 0,
      assists: 0,
    }
  );
  const goalsAssists = goals + assists;

  return (
    <div className={s.main}>
      <PlayerEdit username={player.username} playerData={player} />
      <TeamCard
        name={player.name}
        position={player.position}
        isTeam={player.type === 'team'}
        matches={matches}
        goals={goals}
        assists={assists}
        goalsAssists={goalsAssists}
        goalsPerGame={toPerGame(goals, matches)}
        assistsPerGame={toPerGame(assists, matches)}
        goalsAssistsPerGame={toPerGame(goalsAssists, matches)}
        photo={player.photo}
        number={player.number}
        club={player.club}
        socials={{
          vk: player.vk,
          youtube: player.youtube,
          tiktok: player.tiktok,
          instagram: player.instagram,
          telegram: player.telegram,
        }}
      />
      <AwardList data={player.awards ?? []} />
      <PlayerStatsList playedIn={player.playedIn} />
    </div>
  );
}
