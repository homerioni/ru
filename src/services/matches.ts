import { BetEvent, Club, Match, MatchPlayer, MatchType } from '@prisma/client';
import { apiRoutes } from '@/constants';
import { TCreateMatchData } from '@/types';
import { axiosInstance } from './index';
import { TGetBetOption } from '@/services/bets';

type TGetMatchProps = {
  qty?: number;
  page?: string | number;
  typeId?: number;
  clubId?: number;
};

export type TTeamStats = MatchPlayer & {
  player: {
    name: string;
    number: number;
  };
};

export type TGetMatch = Match & {
  awayClub: Club;
  homeClub: Club;
  players: TTeamStats[];
  type: MatchType;
};

type TGetMatchesResponse = {
  matches: TGetMatch[];
  totalCount: number;
  activePage: number;
  totalPages: number;
};

export const getMatches = async (params?: TGetMatchProps) => {
  const { data } = await axiosInstance.get<TGetMatchesResponse>(
    apiRoutes.match,
    { params }
  );

  return data;
};

export const getMatch = async (id: number | string) => {
  const { data } = await axiosInstance.get<
    TGetMatch & { betEvent: BetEvent & { events: TGetBetOption[] } }
  >(apiRoutes.match, {
    params: { id },
  });

  return data;
};

export const getNextMatch = async () => {
  const { data } = await axiosInstance.get<Omit<TGetMatch, 'players'>>(
    apiRoutes.nextMatch
  );

  return data;
};

export const getNextMatches = async () => {
  const { data } = await axiosInstance.get<Omit<TGetMatch, 'players'>[]>(
    apiRoutes.nextMatches
  );

  return data;
};

export const deleteMatches = async (ids: number[]) => {
  const { data } = await axiosInstance.delete(apiRoutes.match, {
    params: { ids: ids.join(',') },
  });

  return data;
};

export const createMatch = async (match: TCreateMatchData) => {
  const newMatch = {
    score: match.score,
    homeClubId: match.homeClubId,
    awayClubId: match.awayClubId,
    date: match.date,
    typeId: match.typeId,
    players: match.players,
    round: match.round,
  };

  const { data } = await axiosInstance.post(apiRoutes.match, newMatch);

  return data;
};

export const updateMatch = async (match: TCreateMatchData & { id: number }) => {
  const newMatch = {
    id: match.id,
    score: match.score,
    homeClubId: match.homeClubId,
    awayClubId: match.awayClubId,
    date: match.date,
    typeId: match.typeId,
    players: match.players,
    round: match.round,
  };
  const { data } = await axiosInstance.post(apiRoutes.match, newMatch);

  return data;
};
