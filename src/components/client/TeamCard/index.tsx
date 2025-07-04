import Image from 'next/image';
import s from './styles.module.scss';

type TTeamCardProps = {
  small?: boolean;
};

export const TeamCard = ({ small }: TTeamCardProps) => {
  return (
    <div className={`${s.main} ${small ? s.small : ''}`}>
      <div className={s.photo}>
        <Image src={'/1.jpeg'} alt={''} width={500} height={500} />
      </div>
      <div className={s.wrapper}>
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
          {!small && (
            <>
              <p className={s.info}>
                <span>Голов:</span>
                <span>0</span>
              </p>
              <p className={s.info}>
                <span>Асистов:</span>
                <span>0</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
