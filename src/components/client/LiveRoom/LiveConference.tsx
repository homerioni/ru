'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { getJitsiEmbedUrl } from '@/utils/getJitsiEmbedUrl';
import s from './styles.module.scss';

type LiveConferenceProps = {
  jitsiRoomName: string;
};

export const LiveConference = ({ jitsiRoomName }: LiveConferenceProps) => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [joined, setJoined] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  const resolveDisplayName = () => {
    if (isAuthenticated && session?.user) {
      return session.user.name || session.user.username || 'Болельщик';
    }
    return guestName.trim();
  };

  const handleJoin = () => {
    const displayName = resolveDisplayName();
    if (!displayName) return;

    setEmbedUrl(getJitsiEmbedUrl(jitsiRoomName, displayName));
    setJoined(true);
  };

  if (!joined) {
    return (
      <div className={s.conferenceJoin}>
        <h2 className={s.conferenceTitle}>Голосовая конференция</h2>
        <p className={s.conferenceHint}>
          Общайтесь голосом с другими зрителями. Камеру можно не включать.
          Для комфортного звука используйте наушники.
        </p>

        {isAuthenticated && session?.user && (
          <p className={s.conferenceUser}>
            Вы войдёте как{' '}
            <strong>
              {session.user.name || session.user.username || 'Болельщик'}
            </strong>
          </p>
        )}

        {!isAuthenticated && status !== 'loading' && (
          <label className={s.conferenceNameLabel}>
            <span>Ваше имя</span>
            <input
              className={s.conferenceNameInput}
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Как вас представить"
              maxLength={32}
            />
          </label>
        )}

        <button
          type="button"
          className={s.conferenceJoinBtn}
          onClick={handleJoin}
          disabled={
            status === 'loading' ||
            (!isAuthenticated && guestName.trim().length < 2)
          }
        >
          Войти в конференцию
        </button>

        <p className={s.conferenceNote}>
          Не хотите говорить? Оставайтесь в текстовом чате — вкладка выше.
        </p>
      </div>
    );
  }

  return (
    <div className={s.conference}>
      <iframe
        className={s.conferenceFrame}
        src={embedUrl ?? undefined}
        title="Конференция"
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        allowFullScreen
      />
    </div>
  );
};
