import s from './styles.module.scss';

export const MainIntro = () => {
  return (
    <section className={s.main}>
      <video autoPlay muted playsInline loop className={s.video}>
        <source src="/maks.MP4" type="video/mp4" media="(min-width: 768px)" />
        <source src="/team.mp4" type="video/mp4" media="(max-width: 767px)" />
      </video>
      <h1 className={s.title}>One team One dream</h1>
      <p className={s.description}>
        Речичане United — это молодая, но амбициозная футбольная команда,
        основанная в 2025 году группой ярых любителей футбола из города Речица.
      </p>
    </section>
  );
};
