import s from './styles.module.scss';
import Image from 'next/image';
import img from '@/assets/img/telegram.png';

export const TelegramIcon = () => (
  <Image
    className={s.icon}
    src={img}
    alt={'telegram'}
    width={128}
    height={128}
  />
);
