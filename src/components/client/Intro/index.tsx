import Image from 'next/image';
import s from './styles.module.scss';

type TIntroProps = {
  imgSrc: string;
  alt: string;
  title: string;
};

export const Intro = ({ imgSrc, alt, title }: TIntroProps) => {
  return (
    <section className={s.main}>
      <Image
        className={s.bgImage}
        src={imgSrc}
        alt={alt}
        width={1920}
        height={1920}
      />
      <h1 className={s.title}>{title}</h1>
    </section>
  );
};
