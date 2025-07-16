import { axiosInstance } from '@/services/index';
import {
  BetEvent,
  BetOption,
  BetType,
  Club,
  User,
  UserBet,
} from '@prisma/client';
import { apiRoutes } from '@/constants';
import {
  TCreateBet,
  TCreateBetEvent,
  TCreateBetType,
  TUpdateBetEvent,
} from '@/types';
import { TGetMatch } from '@/services/matches';

export const getBetTypes = async () => {
  const { data } = await axiosInstance.get<BetType[]>(apiRoutes.betType);

  return data;
};

export const createBetType = async (type: TCreateBetType) => {
  const { data } = await axiosInstance.post<BetType>(apiRoutes.betType, type);

  return data;
};

export const updateBetType = async (type: TCreateBetType & { id: number }) => {
  const updateType = {
    id: type.id,
    name: type.name,
    code: type.code,
  };

  const { data } = await axiosInstance.post<BetType>(
    apiRoutes.betType,
    updateType
  );

  return data;
};

export const deleteBetType = async (ids: number[]) => {
  const { data } = await axiosInstance.delete(apiRoutes.betType, {
    params: { ids: ids.join(',') },
  });

  return data;
};

export type TGetBetEvents = BetEvent & {
  match: TGetMatch & {
    homeClub: Pick<Club, 'id' | 'logoSrc'>;
    awayClub: Pick<Club, 'id' | 'logoSrc'>;
  };
  events: BetOption[];
};

export type TGetBetEventsData = {
  events: TGetBetEvents[];
  activePage: number;
  totalCount: number;
  totalPages: number;
};

export const getBetEvents = async () => {
  const { data } = await axiosInstance.get<TGetBetEventsData>(
    apiRoutes.betEvent
  );

  return data;
};

export type BetInfo = UserBet & { user: Pick<User, 'name' | 'image'> };

export type TGetBetOption = BetOption & {
  bets: BetInfo[];
};

export type TGetBetEvent = BetEvent & {
  match: TGetMatch;
  events: TGetBetOption[];
};

export const getBetEvent = async (id: number | string) => {
  const { data } = await axiosInstance.get<TGetBetEvent>(apiRoutes.betEvent, {
    params: { id: +id },
  });

  return data;
};

export const deleteBetEvent = async (ids: number[]) => {
  for (const id of ids) {
    const { data: betEvent } = await axiosInstance.get<TGetBetEvent>(
      apiRoutes.betEvent,
      {
        params: { id: +id },
      }
    );

    const bets = betEvent.events.map((event) => event.bets).flat();

    await axiosInstance.post(apiRoutes.refund, bets);
  }

  const { data } = await axiosInstance.delete(apiRoutes.betEvent, {
    params: { ids: ids.join(',') },
  });

  return data;
};

export const createBetEvent = async (event: TCreateBetEvent) => {
  const { data } = await axiosInstance.post<BetEvent>(
    apiRoutes.betEvent,
    event
  );

  return data;
};

export const updateBetEvent = async (event: TUpdateBetEvent) => {
  const updateData = {
    id: event.id,
    matchId: event.matchId,
    events: event.events && {
      updateMany: event.events.updateMany,
    },
  };

  const { data } = await axiosInstance.post(apiRoutes.betEvent, updateData);

  return data;
};

export const addBet = async (bet: TCreateBet) => {
  const { data } = await axiosInstance.post<UserBet | false>(
    apiRoutes.addBet,
    bet
  );

  return data;
};

export const completedEvent = async (id: number) => {
  const { data } = await axiosInstance.post<BetEvent>(
    apiRoutes.completedBetEvent,
    id
  );

  return data;
};
