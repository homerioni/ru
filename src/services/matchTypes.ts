import { Club, Match, MatchType } from '@prisma/client';
import { apiRoutes } from '@/constants';
import { TCreateMatchType } from '@/types';
import { axiosInstance } from './index';
import { TTeamStats } from '@/services/matches';

export const getMatchTypes = async () => {
  const { data } = await axiosInstance.get<(MatchType & { clubs: Club[] })[]>(
    apiRoutes.matchType
  );

  return data;
};

export const getMatchType = async (id: number | string) => {
  const { data } = await axiosInstance.get<
    MatchType & {
      matches: (Match & {
        homeClub: Club;
        awayClub: Club;
        players: TTeamStats[];
      })[];
    } & { clubs: Club[] }
  >(apiRoutes.matchType, {
    params: { id },
  });

  return data;
};

export const getAllMatchesTypes = async (clubId: string) => {
  const { data } = await axiosInstance.get<
    (MatchType & {
      matches: (Match & {
        homeClub: Club;
        awayClub: Club;
        players: TTeamStats[];
      })[];
    } & { clubs: Club[] })[]
  >(apiRoutes.matchTypeGetAll, { params: { clubId } });

  return data;
};

export const deleteMatchTypes = async (ids: number[]) => {
  const { data } = await axiosInstance.delete(apiRoutes.matchType, {
    params: { ids: ids.join(',') },
  });

  return data;
};

export const createMatchType = async (matchType: TCreateMatchType) => {
  const newMatchType = {
    name: matchType.name,
    fullName: matchType.fullName,
    type: matchType.type,
    year: matchType.year,
    clubs: {
      connect: matchType.clubs?.map((clubId) => ({ id: +clubId })),
    },
    isArchive: matchType.isArchive,
  };

  const { data } = await axiosInstance.post(apiRoutes.matchType, newMatchType);

  return data;
};

export const updateMatchType = async (
  matchType: TCreateMatchType & { id: number }
) => {
  const newMatchType = {
    id: matchType.id,
    name: matchType.name,
    fullName: matchType.fullName,
    type: matchType.type,
    year: matchType.year,
    clubs: {
      set: matchType.clubs?.map((clubId) => ({ id: +clubId })),
    },
    isArchive: matchType.isArchive,
  };

  const { data } = await axiosInstance.post(apiRoutes.matchType, newMatchType);

  return data;
};
