import {
  Award,
  Club,
  Match,
  MatchPlayer,
  MatchType,
  Player,
  Transfer,
} from '@prisma/client';

export type TCreateClubData = Omit<Club, 'id' | 'createdAt' | 'updateAt'>;

export type TCreateMatchData = Omit<Match, 'id' | 'createdAt' | 'updateAt'> & {
  players?: {
    create: Omit<MatchPlayer, 'id' | 'matchId'>[];
    deleteMany?: object;
  };
};

export type TCreatePlayerData = Omit<Player, 'id' | 'createdAt' | 'updateAt'>;

export type TGetPlayers = Player & {
  playedIn: {
    goals: number;
    assists: number;
    match: { type: { id: number } };
  }[];
  club: Club;
};

export type TGetPlayer = Player & {
  playedIn: (MatchPlayer & { match: Match & { type: MatchType } })[];
  club: Club;
  awards: Award[];
  transfers: Transfer[];
};

export type TGetMatchTypes = MatchType;

export type TCreateMatchType = Omit<MatchType, 'id'> & { clubs?: string[] };

export type TMessageTg = {
  name: string;
  type: string;
  contact: string;
  message?: string;
};
