'use client';

import { useState } from 'react';
import s from './styles.module.scss';

type LiveStreamPlayerProps = {
  embedUrl: string;
  isCinema?: boolean;
  onToggleCinema?: () => void;
};

export const LiveStreamPlayer = ({
  embedUrl,
  isCinema = false,
  onToggleCinema,
}: LiveStreamPlayerProps) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`${s.wrap} ${isCinema ? s.wrapCinema : ''}`}>
      {onToggleCinema ? (
        <button
          type="button"
          className={s.fullscreenBtn}
          onClick={onToggleCinema}
          aria-label={
            isCinema
              ? 'Выйти из полноэкранного режима'
              : 'Смотреть на весь экран с чатом'
          }
        >
          {isCinema ? '✕' : '⛶'}
        </button>
      ) : null}

      {hasError ? (
        <div className={s.fallback}>
          <p>Не удалось загрузить плеер</p>
          <a href={embedUrl} target="_blank" rel="noopener noreferrer">
            Открыть трансляцию в новой вкладке
          </a>
        </div>
      ) : (
        <iframe
          className={s.iframe}
          src={embedUrl}
          title="Трансляция"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
};
