'use client';

import { useState } from 'react';
import s from './styles.module.scss';

type LiveStreamPlayerProps = {
  embedUrl: string;
};

export const LiveStreamPlayer = ({ embedUrl }: LiveStreamPlayerProps) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={s.wrap}>
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
