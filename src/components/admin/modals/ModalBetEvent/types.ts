import { BetEvent } from '@prisma/client';
import { TGetBetEvents } from '@/services/bets';

export type TModalBetEventProps = {
  data?: TGetBetEvents;
  refetch: () => void;
};

export type TForm = Omit<BetEvent, 'createdAt' | 'updateAt'> & {
  events: string[];
};
