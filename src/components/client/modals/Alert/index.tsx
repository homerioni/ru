import Image from 'next/image';
import okImg from '@/assets/img/ok.svg';
import errorImg from '@/assets/img/error.svg';
import s from './styles.module.scss';

type AlertProps = {
  message: string;
  status?: 'success' | 'error';
};

export const Alert = ({ message, status }: AlertProps) => {
  return (
    <div className={s.main}>
      {status && (
        <Image src={status === 'success' ? okImg : errorImg} alt={'status'} />
      )}
      {message}
    </div>
  );
};
