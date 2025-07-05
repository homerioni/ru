import { Club, Match, MatchEvent, Player } from '@prisma/client';

export type TCreateClubData = Omit<Club, 'id' | 'createdAt' | 'updateAt'>;

export type TCreateMatchData = Omit<Match, 'id' | 'createdAt' | 'updateAt'>;

export type TCreatePlayerData = Omit<
  Player,
  'id' | 'createdAt' | 'updateAt' | 'assists' | 'goals' | 'matches'
>;

export type TCreateMatchEventData = Omit<
  MatchEvent,
  'id' | 'createdAt' | 'updateAt'
>;
