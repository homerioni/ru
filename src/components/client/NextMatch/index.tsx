import { ClubLogo, NAME_POSITION } from '@ui/ClubLogo';
import { NextMatchTimer } from '@/components/client/NextMatch/NextMatchTimer';
import { getNextMatch } from '@/services/matches';
import { getMatchDate } from '@/utils/getMatchDate';
import s from './styles.module.scss';

export const NextMatch = async () => {
  const match = await getNextMatch();

  if (!match) {
    return;
  }

  const matchDate = getMatchDate(match.date);

  return (
    <section className={`${s.main} container`}>
      <ClubLogo logoSrc={match?.homeClub.logoSrc} name={match?.homeClub.name} />
      <div className={s.infoBox}>
        <p className={s.infoTitle}>Следующий матч</p>
        <NextMatchTimer matchDate={matchDate.timestamp} />
        <p className={s.date}>{matchDate.day}</p>
        <p className={s.time}>{matchDate.time}</p>
      </div>
      <ClubLogo
        logoSrc={match?.awayClub.logoSrc}
        name={match?.awayClub.name}
        namePosition={NAME_POSITION.LEFT}
      />
    </section>
  );
};
