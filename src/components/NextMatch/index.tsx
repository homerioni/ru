import logo from '~assets/img/logo.svg';
import logoS from '~assets/img/soutnik.png';
import s from './styles.module.scss';
import { ClubLogo, NAME_POSITION } from '~ui/ClubLogo';

export const NextMatch = () => {
  return (
    <section className={`${s.main} container`}>
      <ClubLogo logoSrc={logo} name={'Речичане United'} />
      <div className={s.infoBox}>
        <p className={s.infoTitle}>Следующий матч</p>
        <p className={s.timer}>11ч : 30м : 45с</p>
        <p className={s.date}>08 июля</p>
        <p className={s.time}>18:00</p>
      </div>
      <ClubLogo
        logoSrc={logoS}
        name={'ФК Спутник'}
        namePosition={NAME_POSITION.LEFT}
      />
    </section>
  );
};
