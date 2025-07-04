import Image from 'next/image';
import s from './styles.module.scss';

export const TeamCard = () => {
  return (
    <div className={s.main}>
      <div className={s.photo}>
        <Image src={'/1.jpeg'} alt={''} width={500} height={500} />
      </div>
      <div className={s.infoWrapper}>
        <p className={s.number}>00</p>
        <div className={s.textWrapper}>
          <p className={s.name}>Артём Горбаль</p>
          <p className={s.info}>
            <span>Позиция:</span>
            <span>Защитник</span>
          </p>
          <p className={s.info}>
            <span>Матчей:</span>
            <span>5</span>
          </p>
        </div>
      </div>
    </div>
  );
};
