import s from './styles.module.scss';
import Image from 'next/image';
import img from '@/assets/img/instagram.png';

export const InstagramIcon = () => (
  <Image
    className={s.icon}
    src={img}
    alt={'instagram'}
    width={128}
    height={128}
  />
);
