import s from './styles.module.scss';
import Image from 'next/image';
import img from '@/assets/img/youtube.png';

export const YoutubeIcon = () => (
  <Image
    className={s.icon}
    src={img}
    alt={'youtube'}
    width={128}
    height={128}
  />
);
