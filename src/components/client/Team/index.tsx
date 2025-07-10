import { TeamCard } from '@/components/client/TeamCard';
import { getPlayers } from '@/services';
import s from './styles.module.scss';

export const Team = async () => {
  const players = await getPlayers().then((res) =>
    res.players.sort((a, b) => b.playedIn.length - a.playedIn.length)
  );

  if (!players) {
    return null;
  }

  return (
    <section className={`${s.main} container`}>
      {players.map((player) => {
        const matches = player.playedIn.length;
        const [goals, assists] = player.playedIn.reduce(
          (acc, item) => [acc[0] + item.goals, acc[1] + item.assists],
          [0, 0]
        );

        return (
          <TeamCard
            key={player.id}
            number={player.number}
            photo={player.photo}
            name={player.name}
            position={player.position}
            matches={matches}
            goals={goals}
            assists={assists}
          />
        );
      })}
    </section>
  );
};
