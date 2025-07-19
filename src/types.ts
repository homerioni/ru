import {
  BetEvent,
  BetOption,
  BetType,
  Club,
  Match,
  MatchPlayer,
  MatchType,
  Player,
  UserBet,
} from '@prisma/client';

export type TCreateClubData = Omit<Club, 'id' | 'createdAt' | 'updateAt'>;

export type TCreateMatchData = Omit<Match, 'id' | 'createdAt' | 'updateAt'> & {
  players?: {
    create: Omit<MatchPlayer, 'id' | 'matchId'>[];
    deleteMany?: object;
  };
};

export type TCreatePlayerData = Omit<Player, 'id' | 'createdAt' | 'updateAt'>;

export type TGetPlayer = Player & {
  playedIn: { goals: number; assists: number }[];
};

export type TCreateMatchType = Omit<MatchType, 'id'>;

export type TCreateBetEvent = Omit<
  BetEvent,
  'id' | 'createdAt' | 'updateAt'
> & {
  events?: {
    create?: Omit<BetOption, 'id' | 'betEventId'>[];
  };
};

export type TUpdateBetEvent = Omit<BetEvent, 'createdAt' | 'updateAt'> & {
  events?: {
    updateMany?: {
      where: { id: number };
      data: Partial<Omit<BetOption, 'id' | 'betEventId'>>;
    }[];
  };
};

export type TCreateBetType = Omit<BetType, 'id' | 'createdAt' | 'updateAt'>;

export type TCreateBet = Omit<UserBet, 'id'>;

export type TMessageTg = {
  name: string;
  type: string;
  contact: string;
  message?: string;
};
