import Image, { StaticImageData } from 'next/image';
import { Coins } from '@ui/Coins';
import s from './styles.module.scss';

type UserInfoProps = {
  img: string | StaticImageData;
  name: string;
  points?: number;
};

export const UserInfo = ({ img, points, name }: UserInfoProps) => {
  return (
    <div className={s.main}>
      <div className={s.info}>
        <p className={s.name}>{name}</p>
        {points !== undefined && <Coins qty={points ?? 0} id="coins" />}
      </div>
      <div className={s.img}>
        <Image src={img} alt={'Аватар'} width={128} height={128} />
      </div>
    </div>
  );
};
