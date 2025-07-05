import { MatchEvent } from '@prisma/client';
import { apiRoutes } from '@/constants';
import { TCreateMatchEventData } from '@/types';
import { axiosInstance } from './index';

export const getEvent = async (id: number | string) => {
  const { data } = await axiosInstance.get<MatchEvent>(apiRoutes.event, {
    params: { id },
  });

  return data;
};

export const deleteEvents = async (ids: number[]) => {
  const { data } = await axiosInstance.delete(apiRoutes.event, {
    params: { ids: ids.join(',') },
  });

  return data;
};

export const createEvent = async (event: TCreateMatchEventData) => {
  const { data } = await axiosInstance.post(apiRoutes.event, event);

  return data;
};

export const updateEvent = async (event: MatchEvent) => {
  const { data } = await axiosInstance.post(apiRoutes.updateEvent, event);

  return data;
};
