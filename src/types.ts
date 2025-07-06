import { Club, Match, Player } from '@prisma/client';

export type TCreateClubData = Omit<Club, 'id' | 'createdAt' | 'updateAt'>;

export type TCreateMatchData = Omit<Match, 'id' | 'createdAt' | 'updateAt'>;

export type TCreatePlayerData = Omit<
  Player,
  'id' | 'createdAt' | 'updateAt' | 'assists' | 'goals' | 'matches'
>;
