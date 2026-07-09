import type { LiveBroadcast } from '@prisma/client';
import s from './styles.module.scss';
import { LiveStreamPlayer } from './LiveStreamPlayer';
import { LiveTabs } from './LiveTabs';

type LiveRoomProps = {
  broadcast: LiveBroadcast;
};

export const LiveRoom = ({ broadcast }: LiveRoomProps) => {
  return (
    <section className={s.main}>
      <div className={s.header}>
        <div className={s.liveBadge}>LIVE</div>
        <h1 className={s.title}>{broadcast.title}</h1>
        {broadcast.description ? (
          <p className={s.description}>{broadcast.description}</p>
        ) : null}
      </div>

      <LiveStreamPlayer embedUrl={broadcast.streamEmbedUrl} />

      <LiveTabs
        broadcastId={broadcast.id}
        jitsiRoomName={broadcast.jitsiRoomName}
      />
    </section>
  );
};
