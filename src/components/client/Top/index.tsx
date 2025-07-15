import Image from 'next/image';
import { Coins } from '@ui/Coins';
import s from './styles.module.scss';

type TopProps = {
  data: {
    points: number;
    name: string;
    image: string;
  }[];
};

export const Top = ({ data }: TopProps) => {
  return (
    <section className={s.main}>
      <h1 className={s.title}>Топ лучших предсказателей</h1>
      <ul className={s.list}>
        {data.map((user, i) => (
          <li key={i} className={s.item}>
            <div className={s.image}>
              <Image src={user.image} alt={'Аватар'} width={256} height={256} />
            </div>
            <div className={s.info}>
              <span>{user.name}</span>
              <Coins qty={user.points} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
