'use client';

import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { getJitsiEmbedUrl } from '@/utils/getJitsiEmbedUrl';
import s from './styles.module.scss';

type LiveConferenceProps = {
  jitsiRoomName: string;
};

export const LiveConference = ({ jitsiRoomName }: LiveConferenceProps) => {
  const { data: session } = useSession();
  const [joined, setJoined] = useState(false);
  const [guestName, setGuestName] = useState('');

  const displayName =
    session?.user?.username ||
    session?.user?.name ||
    guestName.trim() ||
    'Гость';

  const embedUrl = useMemo(
    () => getJitsiEmbedUrl(jitsiRoomName, displayName),
    [jitsiRoomName, displayName]
  );

  if (!joined) {
    return (
      <div className={s.conferenceJoin}>
        <h2 className={s.conferenceTitle}>Голосовая конференция</h2>
        <p className={s.conferenceHint}>
          Общайтесь голосом с другими зрителями. Камеру можно не включать.
          Для комфортного звука используйте наушники.
        </p>

        {!session && (
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
          onClick={() => setJoined(true)}
          disabled={!session && guestName.trim().length < 2}
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
        src={embedUrl}
        title="Конференция"
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        allowFullScreen
      />
    </div>
  );
};
