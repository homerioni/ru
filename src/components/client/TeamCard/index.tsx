import Image from 'next/image';
import s from './styles.module.scss';

type TTeamCardProps = {
  number: number;
  photo: string;
  name: string;
  position: string;
  matches: number;
} & (
  | {
      goals: number;
      assists: number;
      small?: undefined;
    }
  | {
      goals?: undefined;
      assists?: undefined;
      small: true;
    }
);

export const TeamCard = ({
  number,
  photo,
  position,
  name,
  assists,
  goals,
  matches,
  small,
}: TTeamCardProps) => {
  return (
    <div className={`${s.main} ${small ? s.small : ''}`}>
      <div className={s.photo}>
        <Image src={photo} alt={''} width={500} height={500} />
      </div>
      <div className={s.wrapper}>
        <p className={s.number}>{number}</p>
        <div className={s.textWrapper}>
          <p className={s.name}>{name}</p>
          <p className={s.info}>
            <span>Позиция:</span>
            <span>{position}</span>
          </p>
          <p className={s.info}>
            <span>Матчей:</span>
            <span>{matches}</span>
          </p>
          {!small && (
            <>
              <p className={s.info}>
                <span>Голов:</span>
                <span>{goals}</span>
              </p>
              <p className={s.info}>
                <span>Асистов:</span>
                <span>{assists}</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
