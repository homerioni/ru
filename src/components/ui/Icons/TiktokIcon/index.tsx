import s from './styles.module.scss';
import Image from 'next/image';
import img from '@/assets/img/tiktok.png';

export const TiktokIcon = () => (
  <Image className={s.icon} src={img} alt={'tiktok'} width={128} height={128} />
);
