import s from './styles.module.scss';

type PlayerStatsProps = {
  matches: number;
  goals: number;
  assists: number;
  title: string;
};

export const PlayerStats = ({
  matches,
  goals,
  assists,
  title,
}: PlayerStatsProps) => {
  return (
    <div className={s.main}>
      <h3 className={s.title}>{title}</h3>
      <div className={s.header}>
        <p>Матчей</p>
        <p>Голов</p>
        <p>Голевых пасов</p>
      </div>
      <div className={s.content}>
        <p>{matches}</p>
        <p>{goals}</p>
        <p>{assists}</p>
      </div>
    </div>
  );
};
