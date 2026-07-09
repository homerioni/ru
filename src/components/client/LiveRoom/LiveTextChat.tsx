'use client';

import { useSession } from 'next-auth/react';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { LiveChatMessage } from '@prisma/client';
import { getLiveChatMessages, postLiveChatMessage } from '@/services/liveChat';
import s from './styles.module.scss';

const GUEST_NAME_KEY = 'liveChatGuestName';
const POLL_INTERVAL = 2500;

type LiveTextChatProps = {
  broadcastId: string;
};

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const LiveTextChat = ({ broadcastId }: LiveTextChatProps) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const lastAfterRef = useRef<string>(new Date(0).toISOString());
  const [input, setInput] = useState('');
  const [guestName, setGuestName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  useEffect(() => {
    const saved = sessionStorage.getItem(GUEST_NAME_KEY);
    if (saved) setGuestName(saved);
  }, []);

  const mergeMessages = useCallback((incoming: LiveChatMessage[]) => {
    if (!incoming.length) return;
    setMessages((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      const merged = [...prev];
      for (const msg of incoming) {
        if (!ids.has(msg.id)) merged.push(msg);
      }
      return merged;
    });
    const last = incoming[incoming.length - 1];
    lastAfterRef.current =
      typeof last.createdAt === 'string'
        ? last.createdAt
        : new Date(last.createdAt).toISOString();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const initial = await getLiveChatMessages(broadcastId);
      if (!cancelled) {
        setMessages(initial);
        if (initial.length) {
          const last = initial[initial.length - 1];
          lastAfterRef.current =
            typeof last.createdAt === 'string'
              ? last.createdAt
              : new Date(last.createdAt).toISOString();
        }
      }
    };

    load();

    const interval = setInterval(async () => {
      try {
        const incoming = await getLiveChatMessages(
          broadcastId,
          lastAfterRef.current
        );
        if (!cancelled && incoming.length) {
          mergeMessages(incoming);
        }
      } catch {
        /* ignore poll errors */
      }
    }, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [broadcastId, mergeMessages]);

  useEffect(() => {
    if (!shouldScrollRef.current || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    shouldScrollRef.current = scrollHeight - scrollTop - clientHeight < 80;
  };

  const getUsername = useCallback(() => {
    return (
      session?.user?.username ||
      session?.user?.name ||
      guestName.trim()
    );
  }, [session, guestName]);

  const saveGuestName = (name: string) => {
    const trimmed = name.trim();
    setGuestName(trimmed);
    sessionStorage.setItem(GUEST_NAME_KEY, trimmed);
    setShowNamePrompt(false);
  };

  const sendMessage = async (text: string) => {
    const username = getUsername();
    if (!username) {
      setShowNamePrompt(true);
      return;
    }

    setIsSending(true);
    setError('');

    try {
      const msg = await postLiveChatMessage({
        broadcastId,
        message: text,
        guestName: session ? undefined : username,
      });
      setMessages((prev) => [...prev, msg]);
      lastAfterRef.current =
        typeof msg.createdAt === 'string'
          ? msg.createdAt
          : new Date(msg.createdAt).toISOString();
      setInput('');
      shouldScrollRef.current = true;
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error ?? 'Не удалось отправить');
    } finally {
      setIsSending(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;
    sendMessage(text);
  };

  return (
    <div className={s.chat}>
      <div
        ref={listRef}
        className={s.messages}
        onScroll={handleScroll}
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <p className={s.empty}>Пока нет сообщений. Напишите первым!</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={s.message}>
              <div className={s.messageMeta}>
                <span className={s.messageAuthor}>{msg.username}</span>
                <span className={s.messageTime}>{formatTime(msg.createdAt)}</span>
              </div>
              <p className={s.messageText}>{msg.message}</p>
            </div>
          ))
        )}
      </div>

      {showNamePrompt && !session && (
        <div className={s.namePrompt}>
          <p>Введите имя для чата</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const name = String(fd.get('name') ?? '');
              if (name.trim().length >= 2) saveGuestName(name);
            }}
          >
            <input
              name="name"
              className={s.nameInput}
              placeholder="Ваше имя"
              maxLength={32}
              autoFocus
              required
              minLength={2}
            />
            <button type="submit" className={s.nameBtn}>
              OK
            </button>
          </form>
        </div>
      )}

      <form className={s.inputBar} onSubmit={onSubmit}>
        {error ? <p className={s.error}>{error}</p> : null}
        <div className={s.inputRow}>
          <input
            className={s.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              session
                ? 'Сообщение...'
                : guestName
                  ? `Сообщение от ${guestName}...`
                  : 'Сообщение...'
            }
            maxLength={500}
            enterKeyHint="send"
            autoComplete="off"
          />
          <button
            type="submit"
            className={s.sendBtn}
            disabled={!input.trim() || isSending}
            aria-label="Отправить"
          >
            →
          </button>
        </div>
      </form>
    </div>
  );
};
