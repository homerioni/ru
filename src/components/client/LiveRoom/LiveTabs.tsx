'use client';

import { useState } from 'react';
import s from './styles.module.scss';
import { LiveTextChat } from './LiveTextChat';
import { LiveConference } from './LiveConference';

type LiveTab = 'chat' | 'conference';

type LiveTabsProps = {
  broadcastId: string;
  jitsiRoomName: string;
};

export const LiveTabs = ({ broadcastId, jitsiRoomName }: LiveTabsProps) => {
  const [tab, setTab] = useState<LiveTab>('chat');

  return (
    <div className={s.tabsWrap}>
      <div className={s.tabBar} role="tablist" aria-label="Чат и конференция">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'chat'}
          className={`${s.tab} ${tab === 'chat' ? s.active : ''}`}
          onClick={() => setTab('chat')}
        >
          Текстовый чат
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'conference'}
          className={`${s.tab} ${tab === 'conference' ? s.active : ''}`}
          onClick={() => setTab('conference')}
        >
          Конференция
        </button>
      </div>

      <div className={s.tabPanel} role="tabpanel">
        {tab === 'chat' ? (
          <LiveTextChat broadcastId={broadcastId} />
        ) : (
          <LiveConference jitsiRoomName={jitsiRoomName} />
        )}
      </div>
    </div>
  );
};
