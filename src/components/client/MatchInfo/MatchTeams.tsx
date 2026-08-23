import { TGetMatch } from '@/services/matches';
import { MY_CLUB_ID } from '@/constants';
import Link from 'next/link';
import s from './styles.module.scss';

type MatchTeamsProps = {
  data: TGetMatch;
};

export const MatchTeams = ({ data }: MatchTeamsProps) => {
  const players = data.players
    .filter((item) => item.clubId === MY_CLUB_ID)
    .sort((a, b) => (a.player.number ?? 0) - (b.player.number ?? 0));

  if (!players.length) {
    return null;
  }

  return (
    <div className={s.team}>
      <div className={s.active}>
        <div className={s.teamHeader}>
          <span>#</span>
          <span>Имя</span>
          <span>Г</span>
          <span>П</span>
        </div>
        {players.map((item) => (
          <div key={item.id} className={s.teamItem}>
            <span className={s.number}>{item.player.number}</span>
            <Link href={`/player/${item.player.id}`} className={s.name}>
              {item.player.name}
            </Link>
            <span className={s.stats}>{item.goals || ''}</span>
            <span className={s.stats}>{item.assists || ''}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
