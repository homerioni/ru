import { Club, Match, MatchPlayer, MatchType, Player } from '@prisma/client';

export type TCreateClubData = Omit<Club, 'id' | 'createdAt' | 'updateAt'>;

export type TCreateMatchData = Omit<Match, 'id' | 'createdAt' | 'updateAt'> & {
  players: {
    create: Omit<MatchPlayer, 'id' | 'matchId'>[];
    deleteMany?: object;
  };
};

export type TCreatePlayerData = Omit<Player, 'id' | 'createdAt' | 'updateAt'>;

export type TGetPlayer = Player & {
  playedIn: { goals: number; assists: number }[];
};

export type TCreateMatchType = Omit<MatchType, 'id'>;
