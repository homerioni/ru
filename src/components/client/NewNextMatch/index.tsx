import Image from 'next/image';
import dima1 from '@/assets/img/dima1.webp';
import dima2 from '@/assets/img/dima2.webp';
import dima3 from '@/assets/img/dima3.webp';
import shifu1 from '@/assets/img/shifu1.webp';
import shifu2 from '@/assets/img/shifu2.webp';
import nad from '@/assets/img/nad-player.webp';
import s from './styles.module.scss';

export const NewNextMatch = () => {
  return (
    <section className={`${s.main} container`}>
      <div className={s.animate}>
        <Image src={dima1} alt={''} />
        <Image src={dima2} alt={''} />
        <Image src={shifu1} alt={''} />
        <Image src={shifu2} alt={''} />
        <Image src={nad} alt={''} />
        <Image src={dima3} alt={''} />
      </div>
    </section>
  );
};
