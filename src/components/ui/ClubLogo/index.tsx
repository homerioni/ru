import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { SIZES } from '@/constants';
import { getClubHref } from '@/utils/getClubHref';
import s from './styles.module.scss';

export enum NAME_POSITION {
  LEFT = 'left',
  RIGHT = 'right',
  BOTTOM = 'bottom',
}

type TNextMatchClubProps = {
  logoSrc: string | StaticImageData;
  name: string;
  clubId?: number;
  namePosition?: NAME_POSITION;
  size?: SIZES;
  background?: boolean;
};

export const ClubLogo = ({
  logoSrc,
  name,
  clubId,
  namePosition = NAME_POSITION.RIGHT,
  size = SIZES.m,
  background,
}: TNextMatchClubProps) => {
  const content = (
    <div className={`${s.main} ${s[namePosition]} ${s[size]}`}>
      <div className={`${s.logo} ${background ? s.bg : ''}`}>
        <Image src={logoSrc} alt={`Логотип ${name}`} width={500} height={500} />
      </div>
      <h2 className={s.name}>{name}</h2>
    </div>
  );

  if (clubId) {
    return (
      <Link href={getClubHref(clubId)} className={s.link}>
        {content}
      </Link>
    );
  }

  return content;
};
