'use client';

import { BetEvent as TBetEvent } from '@prisma/client';
import { addBet, TGetBetOption } from '@/services/bets';
import s from './styles.module.scss';
import { BetEventItem } from '@/components/client/BetEvent/BetEventItem';
import { useEffect, useState } from 'react';
import { Alert } from '@/components/client/modals/Alert';
import { TGetMatch } from '@/services/matches';

type BetEventProps = {
  match: TGetMatch & { betEvent: TBetEvent & { events: TGetBetOption[] } };
  events: TGetBetOption[];
  isCompleted?: boolean;
};

export const BetEvent = ({ match, events, isCompleted }: BetEventProps) => {
  const [message, setMessage] = useState('');

  const handleBet = async (points: number, betId: number, value?: unknown) => {
    const userId = sessionStorage.getItem('userId');

    if (!userId) {
      setMessage('Вы не авторизованы');
      return;
    }

    return await addBet({
      points,
      betId,
      userId: userId,
      value: JSON.stringify(value),
    }).then((res) => {
      if (!res) {
        setMessage('У вас недостаточно монет');
      } else {
        location.reload();
      }

      return !!res;
    });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (message) {
      timer = setTimeout(() => {
        setMessage('');
      }, 4000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [message]);

  return (
    <section className={`${s.main} container`}>
      <ul className={s.list}>
        {events.map((event) => (
          <BetEventItem
            key={event.id}
            betId={event.id}
            name={event.name}
            ratio={event.ratio.map((x) => x / 100)}
            code={event.code}
            bets={event.bets}
            handleBetAction={handleBet}
            isCompleted={isCompleted}
            match={match}
            addAlertAction={(message: string) => setMessage(message)}
          />
        ))}
      </ul>
      {message && <Alert message={message} status={'error'} />}
    </section>
  );
};
