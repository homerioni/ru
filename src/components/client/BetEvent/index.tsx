'use client';

import { BetEvent as TBetEvent } from '@prisma/client';
import { addBet, TGetBetOption } from '@/services/bets';
import s from './styles.module.scss';
import { BetEventItem } from '@/components/client/BetEvent/BetEventItem';
import { useEffect, useState } from 'react';
import { Alert } from '@/components/client/modals/Alert';
import { TGetMatch } from '@/services/matches';
import { SessionProvider, useSession } from 'next-auth/react';

type BetEventProps = {
  match: TGetMatch & { betEvent: TBetEvent & { events: TGetBetOption[] } };
  events: TGetBetOption[];
  isCompleted?: boolean;
};

export const BetEvent = (props: BetEventProps) => {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <BetEventContent {...props} />
    </SessionProvider>
  );
};

export const BetEventContent = ({
  match,
  events,
  isCompleted,
}: BetEventProps) => {
  const [message, setMessage] = useState('');
  const { data, status } = useSession();

  const handleBet = async (points: number, betId: number, value?: unknown) => {
    console.log(data);

    if (status !== 'authenticated') {
      setMessage('Вы не авторизованы');
      return;
    }

    if (data?.user?.id) {
      return await addBet({
        points,
        betId,
        userId: data?.user?.id,
        value: JSON.stringify(value),
      }).then((res) => {
        if (!res) {
          setMessage('У вас недостаточно монет');
        } else {
          location.reload();
        }

        return !!res;
      });
    }
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
