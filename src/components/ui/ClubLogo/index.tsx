import Image, { StaticImageData } from 'next/image';
import { SIZES } from '~constants/sizes';
import s from './styles.module.scss';

export enum NAME_POSITION {
  LEFT = 'left',
  RIGHT = 'right',
  BOTTOM = 'bottom',
}

type TNextMatchClubProps = {
  logoSrc: string | StaticImageData;
  name: string;
  namePosition?: NAME_POSITION;
  size?: SIZES;
};

export const ClubLogo = ({
  logoSrc,
  name,
  namePosition = NAME_POSITION.RIGHT,
  size = SIZES.m,
}: TNextMatchClubProps) => {
  return (
    <div className={`${s.main} ${s[namePosition]} ${s[size]}`}>
      <div className={s.logo}>
        <Image src={logoSrc} alt={`Логотип ${name}`} />
      </div>
      <h2 className={s.name}>{name}</h2>
    </div>
  );
};
