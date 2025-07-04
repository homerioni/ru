import logo from '@/assets/img/logo.svg';
import logoS from '@/assets/img/soutnik.png';
import s from './styles.module.scss';
import { ClubLogo, NAME_POSITION } from '@ui/ClubLogo';
import { NextMatchTimer } from '@/components/client/NextMatch/NextMatchTimer';

export const NextMatch = () => {
  return (
    <section className={`${s.main} container`}>
      <ClubLogo logoSrc={logo} name={'Речичане United'} />
      <div className={s.infoBox}>
        <p className={s.infoTitle}>Следующий матч</p>
        <NextMatchTimer matchDate={new Date(2025, 6, 5, 15, 0).getTime()} />
        <p className={s.date}>05 июля</p>
        <p className={s.time}>15:00</p>
      </div>
      <ClubLogo
        logoSrc={logoS}
        name={'ФК Спутник'}
        namePosition={NAME_POSITION.LEFT}
      />
    </section>
  );
};
