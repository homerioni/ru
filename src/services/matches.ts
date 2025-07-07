import { Club, Match } from '@prisma/client';
import { apiRoutes } from '@/constants';
import { TCreateMatchData } from '@/types';
import { axiosInstance } from './index';

type TGetMatchProps = {
  qty?: number;
  page?: string | number;
};

export type TTeamStats = {
  id: number;
  goals: number;
  assists: number;
  player: {
    name: string;
    number: number;
  };
};

export type TGetMatch = Match & { club: Club; players: TTeamStats[] };

type TGetMatchesResponse = {
  matches: TGetMatch[];
  totalCount: number;
  activePage: number;
  totalPages: number;
};

export const getMatches = async (params?: TGetMatchProps) => {
  const { data } = await axiosInstance.get<TGetMatchesResponse>(
    apiRoutes.matches,
    {
      params,
    }
  );

  return data;
};

export const getMatch = async (id: number | string) => {
  const { data } = await axiosInstance.get<Match>(apiRoutes.match, {
    params: { id },
  });

  return data;
};

export const deleteMatches = async (ids: number[]) => {
  const { data } = await axiosInstance.delete(apiRoutes.matches, {
    params: { ids: ids.join(',') },
  });

  return data;
};

export const createMatch = async (match: TCreateMatchData) => {
  const newMatch = {
    score: match.score,
    clubId: match.clubId,
    date: match.date,
    type: match.type,
    players: match.players,
  };

  const { data } = await axiosInstance.post(apiRoutes.match, newMatch);

  return data;
};

export const updateMatch = async (match: TCreateMatchData & { id: number }) => {
  const newMatch = {
    id: match.id,
    score: match.score,
    clubId: match.clubId,
    date: match.date,
    type: match.type,
    players: match.players,
  };
  const { data } = await axiosInstance.post(apiRoutes.updateMatch, newMatch);

  return data;
};
