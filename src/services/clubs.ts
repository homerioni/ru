import { Club } from '@prisma/client';
import { apiRoutes } from '@/constants';
import { TCreateClubData } from '@/types';
import { axiosInstance } from './index';

type TGetClubsProps = {
  search?: string;
  qty?: number;
  page?: string | number;
};

type TGetClubsResponse = {
  clubs: Club[];
  totalCount: number;
  activePage: number;
  totalPages: number;
};

export const getClubs = async (params?: TGetClubsProps) => {
  const { data } = await axiosInstance.get<TGetClubsResponse>(apiRoutes.clubs, {
    params,
  });

  return data;
};

export const getClub = async (id: number | string) => {
  const { data } = await axiosInstance.get<Club>(apiRoutes.club, {
    params: { id },
  });

  return data;
};

export const deleteClubs = async (ids: number[]) => {
  const { data } = await axiosInstance.delete(apiRoutes.clubs, {
    params: { ids: ids.join(',') },
  });

  return data;
};

export const createClub = async (club: TCreateClubData) => {
  const { data } = await axiosInstance.post(apiRoutes.club, club);

  return data;
};

export const updateClub = async (club: Club) => {
  const newData = {
    id: club.id,
    logoSrc: club.logoSrc,
    name: club.name,
  };

  const { data } = await axiosInstance.post(apiRoutes.updateClub, newData);

  return data;
};
