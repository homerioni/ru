import s from './styles.module.scss';

type PlayerStatsProps = {
  matches: number;
  goals: number;
  assists: number;
  goalsPerGame: number;
  assistsPerGame: number;
  goalsAssists: number;
  goalsAssistsPerGame: number;
  title: string;
};

export const PlayerStats = ({
  matches,
  goals,
  assists,
  goalsPerGame,
  assistsPerGame,
  goalsAssists,
  goalsAssistsPerGame,
  title,
}: PlayerStatsProps) => {
  return (
    <div className={s.main}>
      <h3 className={s.title}>{title}</h3>
      <div className={s.table}>
        <div className={s.header}>
          <p>Матчей</p>
          <p>Голов</p>
          <p>Пасов</p>
          <p>Г+П</p>
        </div>
        <div className={s.content}>
          <p>{matches}</p>
          <p>{goals}</p>
          <p>{assists}</p>
          <p>{goalsAssists}</p>
        </div>
        <div className={s.header}>
          <p />
          <p>Г/И</p>
          <p>П/И</p>
          <p>Г+П/И</p>
        </div>
        <div className={s.content}>
          <p />
          <p>{goalsPerGame}</p>
          <p>{assistsPerGame}</p>
          <p>{goalsAssistsPerGame}</p>
        </div>
      </div>
    </div>
  );
};
