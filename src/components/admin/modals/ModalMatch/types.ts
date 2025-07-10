import { TGetMatch } from '@/services/matches';
import { Match } from '@prisma/client';

export type TModalPlayerProps = {
  data?: TGetMatch;
  refetch: () => void;
};

export type PlayerFormData = {
  playerId: number;
  goals: number;
  assists: number;
};

export type TForm = Omit<
  Match,
  'createdAt' | 'updateAt' | 'id' | 'score' | 'date'
> & {
  date: string;
  goals: number;
  missed: number;
  time: string;
  team: { [key: string]: PlayerFormData };
};
