import s from './styles.module.scss';
import Image from 'next/image';
import img from '@/assets/img/vk.png';

export const VkIcon = () => (
  <Image className={s.icon} src={img} alt={'vk'} width={128} height={128} />
);
