import Image from 'next/image';
import coins from '../../../assets/img/coins.svg';
import s from './styles.module.scss';

type CoinsProps = {
  qty: number;
  id?: string;
  status?: 'increment' | 'decrement';
};

export const Coins = ({ qty, status, id }: CoinsProps) => {
  return (
    <p className={`${s.main} ${status ? s[status] : ''}`}>
      <span id={id}>{Math.floor(qty).toLocaleString()}</span>
      <Image src={coins} alt={'Монеты'} />
    </p>
  );
};
