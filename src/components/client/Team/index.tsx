import { TeamCard } from '@/components/client/TeamCard';
import { TGetPlayer } from '@/types';
import s from './styles.module.scss';

type TeamProps = {
  players: TGetPlayer[];
};

export const Team = ({ players }: TeamProps) => {
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
