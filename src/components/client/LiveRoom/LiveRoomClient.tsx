'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LiveBroadcast } from '@prisma/client';
import s from './styles.module.scss';
import { LiveStreamPlayer } from './LiveStreamPlayer';
import { LiveTextChat } from './LiveTextChat';
import { DiscordWidget } from './DiscordWidget';

type LiveRoomClientProps = {
  broadcast: LiveBroadcast;
};

function getFullscreenElement(): Element | null {
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
  };
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

async function requestFullscreen(el: HTMLElement) {
  const anyEl = el as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
  };
  if (el.requestFullscreen) {
    await el.requestFullscreen();
  } else if (anyEl.webkitRequestFullscreen) {
    await anyEl.webkitRequestFullscreen();
  }
}

async function exitFullscreen() {
  const doc = document as Document & {
    webkitExitFullscreen?: () => Promise<void>;
  };
  if (doc.fullscreenElement && doc.exitFullscreen) {
    await doc.exitFullscreen();
  } else if (doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen();
  }
}

export const LiveRoomClient = ({ broadcast }: LiveRoomClientProps) => {
  const [isCinema, setIsCinema] = useState(false);
  const cinemaRef = useRef<HTMLDivElement>(null);

  const closeCinema = useCallback(() => {
    setIsCinema(false);
    document.body.style.overflow = '';
    if (getFullscreenElement()) {
      void exitFullscreen();
    }
  }, []);

  const openCinema = useCallback(async () => {
    setIsCinema(true);
    document.body.style.overflow = 'hidden';

    const el = cinemaRef.current;
    if (!el) return;

    try {
      await requestFullscreen(el);
    } catch {
      /* CSS fixed fallback */
    }
  }, []);

  const toggleCinema = useCallback(() => {
    if (isCinema) {
      closeCinema();
    } else {
      void openCinema();
    }
  }, [closeCinema, isCinema, openCinema]);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!getFullscreenElement() && isCinema) {
        setIsCinema(false);
        document.body.style.overflow = '';
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      document.body.style.overflow = '';
    };
  }, [isCinema]);

  return (
    <section className={`${s.main} ${isCinema ? s.mainCinema : ''}`}>
      {!isCinema && (
        <div className={s.header}>
          <div className={s.liveBadge}>LIVE</div>
          <h1 className={s.title}>{broadcast.title}</h1>
          {broadcast.description ? (
            <p className={s.description}>{broadcast.description}</p>
          ) : null}
        </div>
      )}

      <div
        ref={cinemaRef}
        className={`${s.cinemaShell} ${isCinema ? s.cinemaActive : ''}`}
      >
        {isCinema && (
          <div className={s.cinemaTopBar}>
            <span className={s.cinemaTopTitle}>{broadcast.title}</span>
            <button
              type="button"
              className={s.cinemaCloseBtn}
              onClick={closeCinema}
              aria-label="Выйти из полноэкранного режима"
            >
              ✕
            </button>
          </div>
        )}

        <div className={s.cinemaMedia}>
          <LiveStreamPlayer
            embedUrl={broadcast.streamEmbedUrl}
            isCinema={isCinema}
            onToggleCinema={toggleCinema}
          />
        </div>

        <div className={s.chatSection}>
          {!isCinema && <h2 className={s.chatTitle}>Чат</h2>}
          <LiveTextChat broadcastId={broadcast.id} compact={isCinema} />
        </div>
      </div>

      {!isCinema && (
        <>
          <DiscordWidget />
          <div className={s.dogSpacer} aria-hidden />
        </>
      )}
    </section>
  );
};
