'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  defaultGuestNickname,
  fetchLeaderboard,
  normalizeNickname,
  TLeaderboardResponse,
  TPlayerProfile,
} from '../logic/leaderboard';
import s from '../styles.module.scss';

type NicknameGateProps = {
  profile: TPlayerProfile;
  onSubmit: (nickname: string) => void;
};

export const NicknameGate = ({ profile, onSubmit }: NicknameGateProps) => {
  const guestNick = defaultGuestNickname(profile.clientId);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    const cleaned = normalizeNickname(value);
    if (cleaned.length === 1) {
      setError('Минимум 2 символа или оставь пустым');
      return;
    }
    onSubmit(cleaned.length >= 2 ? cleaned : guestNick);
  };

  return (
    <div className={s.nickGate} role="dialog" aria-modal="true" aria-label="Вход в раздевалку">
      <div className={s.nickCard}>
        <div
          className={s.logo}
          style={{ backgroundImage: 'url(/game/kvas/props/logo.png)' }}
          aria-hidden
        />
        <p className={s.nickTitle}>Позывной в раздевалке</p>
        <p className={s.nickDesc}>
          Твоё имя появится в общем рейтинге «Ясен Квасен»
        </p>
        <form
          className={s.nickForm}
          onSubmit={(event) => {
            event.preventDefault();
            handleConfirm();
          }}
        >
          <input
            type="text"
            className={s.nickInput}
            value={value}
            maxLength={24}
            placeholder={guestNick}
            autoFocus
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError('');
            }}
          />
          {error && <p className={s.nickError}>{error}</p>}
          <button type="submit" className={`${s.buyFull} ${s.buyReady}`}>
            В раздевалку!
          </button>
          <button
            type="button"
            className={s.nickSkip}
            onClick={() => onSubmit(guestNick)}
          >
            Зайти как {guestNick}
          </button>
        </form>
      </div>
    </div>
  );
};

type LeaderboardPanelProps = {
  opened: boolean;
  profile: TPlayerProfile;
  cans: number;
  sips: number;
  onRename: (nickname: string) => Promise<void> | void;
};

export const LeaderboardPanel = ({
  opened,
  profile,
  cans,
  sips,
  onRename,
}: LeaderboardPanelProps) => {
  const [data, setData] = useState<TLeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nickInput, setNickInput] = useState(profile.nickname);
  const [nickError, setNickError] = useState('');
  const lastFetchRef = useRef(0);

  const load = useCallback(
    async (force = false) => {
      const now = Date.now();
      if (!force && now - lastFetchRef.current < 4000 && data) return;
      lastFetchRef.current = now;
      setLoading(true);
      const res = await fetchLeaderboard(profile.clientId);
      if (res) setData(res);
      setLoading(false);
    },
    [profile.clientId, data]
  );

  useEffect(() => {
    if (!opened) return;
    setNickInput(profile.nickname);
    void load(true);
  }, [opened, profile.nickname]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitRename = async () => {
    const cleaned = normalizeNickname(nickInput);
    if (cleaned.length < 2) {
      setNickError('Минимум 2 символа');
      return;
    }
    setNickError('');
    setEditing(false);
    await onRename(cleaned);
    await load(true);
  };

  return (
    <div className={s.lbWrap}>
      <div className={s.lbProfileBox}>
        <div className={s.lbProfileTop}>
          <div>
            <p className={s.lbLabel}>Твой позывной</p>
            <p className={s.lbMyNick}>{profile.nickname || 'Не задан'}</p>
          </div>
          <button
            type="button"
            className={s.lbSmallBtn}
            onClick={() => {
              setEditing((prev) => !prev);
              setNickInput(profile.nickname);
              setNickError('');
            }}
          >
            {editing ? 'Отмена' : 'Сменить ник'}
          </button>
        </div>

        {editing && (
          <form
            className={s.lbEditRow}
            onSubmit={(event) => {
              event.preventDefault();
              submitRename();
            }}
          >
            <input
              type="text"
              className={s.nickInput}
              value={nickInput}
              maxLength={24}
              placeholder="Новый никнейм"
              onChange={(event) => {
                setNickInput(event.target.value);
                if (nickError) setNickError('');
              }}
            />
            <button type="submit" className={`${s.buy} ${s.buyReady}`}>
              ОК
            </button>
          </form>
        )}
        {nickError && <p className={s.nickError}>{nickError}</p>}

        <div className={s.lbMyStats}>
          <span>
            Место: {data?.me ? `#${data.me.rank}` : '—'}
            {data ? ` из ${data.total}` : ''}
          </span>
          <span>Банки: {cans}</span>
          <span>Глотки: {sips}</span>
        </div>
      </div>

      <div className={s.lbToolbar}>
        <span className={s.lbSyncNote}>Синхронизация раз в 30 сек</span>
        <button
          type="button"
          className={s.lbSmallBtn}
          disabled={loading}
          onClick={() => void load(true)}
        >
          {loading ? 'Загрузка...' : 'Обновить'}
        </button>
      </div>

      {!data && loading ? (
        <p className={s.emptyText}>Загружаем таблицу...</p>
      ) : !data || data.entries.length === 0 ? (
        <p className={s.emptyText}>Пока пусто. Выпей первую банку!</p>
      ) : (
        <ul className={s.lbList}>
          {data.entries.map((entry, index) => {
            const rank = index + 1;
            const isMe = entry.id === profile.clientId;
            const medalClass =
              rank === 1
                ? s.lbRank1
                : rank === 2
                  ? s.lbRank2
                  : rank === 3
                    ? s.lbRank3
                    : '';
            return (
              <li key={entry.id} className={`${s.lbRow} ${isMe ? s.lbRowMe : ''}`}>
                <span className={`${s.lbPos} ${medalClass}`}>#{rank}</span>
                <div className={s.lbMeta}>
                  <p className={s.lbName}>
                    {entry.nickname}
                    {isMe ? ' (ты)' : ''}
                  </p>
                  <p className={s.lbSub}>
                    {entry.rankName} · {entry.bellyName}
                  </p>
                </div>
                <div className={s.lbScore}>
                  <p className={s.lbCans}>{entry.cans} бан.</p>
                  <p className={s.lbSips}>{entry.sips} гл.</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
