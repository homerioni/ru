import { LiveBroadcast } from '@prisma/client';
import { apiRoutes } from '@/constants';
import { axiosInstance } from './index';

export const getActiveBroadcast = async () => {
  const { data } = await axiosInstance.get<{ broadcast: LiveBroadcast | null }>(
    `${apiRoutes.broadcast}?active=1`
  );

  return data.broadcast;
};

export const getBroadcastsAll = async () => {
  const { data } = await axiosInstance.get<{ broadcasts: LiveBroadcast[] }>(
    `${apiRoutes.broadcast}?all=1`
  );

  return data.broadcasts;
};

type TCreateBroadcast = Pick<
  LiveBroadcast,
  'title' | 'description' | 'streamInput' | 'jitsiRoomName' | 'isActive'
>;

export const createBroadcast = async (payload: TCreateBroadcast) => {
  const { data } = await axiosInstance.post<LiveBroadcast>(
    apiRoutes.broadcast,
    payload
  );

  return data;
};

export const updateBroadcast = async (
  id: string,
  payload: Partial<TCreateBroadcast>
) => {
  const { data } = await axiosInstance.patch<LiveBroadcast>(
    `${apiRoutes.broadcast}/${id}`,
    payload
  );

  return data;
};

export const deleteBroadcasts = async (ids: string[]) => {
  await Promise.all(
    ids.map((id) => axiosInstance.delete(`${apiRoutes.broadcast}/${id}`))
  );
};
