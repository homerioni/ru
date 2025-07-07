import { Club, Match, MatchPlayer, Player } from '@prisma/client';

export type TCreateClubData = Omit<Club, 'id' | 'createdAt' | 'updateAt'>;

export type TCreateMatchData = Omit<Match, 'id' | 'createdAt' | 'updateAt'> & {
  players: {
    create: Omit<MatchPlayer, 'id' | 'matchId'>[];
    deleteMany?: object;
  };
};

export type TCreatePlayerData = Omit<
  Player,
  'id' | 'createdAt' | 'updateAt' | 'assists' | 'goals' | 'matches'
>;
