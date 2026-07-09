import Link from 'next/link';
import { DISCORD } from '@/constants';
import s from './styles.module.scss';

export const DiscordWidget = () => {
  const widgetSrc = DISCORD.serverId
    ? `https://discord.com/widget?id=${DISCORD.serverId}&theme=dark`
    : null;

  return (
    <section className={s.discord}>
      <div className={s.discordHeader}>
        <h2 className={s.discordTitle}>Discord</h2>
        <p className={s.discordHint}>
          Голосовой чат и общение в нашем Discord-сервере
        </p>
      </div>

      {widgetSrc ? (
        <iframe
          className={s.discordFrame}
          src={widgetSrc}
          title="Discord сервер Речичане United"
          allow="clipboard-write; encrypted-media; fullscreen"
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        />
      ) : null}

      <Link
        href={DISCORD.invite}
        className={s.discordBtn}
        target="_blank"
        rel="noopener noreferrer"
      >
        Присоединиться к Discord
      </Link>
    </section>
  );
};
