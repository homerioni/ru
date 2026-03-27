import { axiosInstance } from '@/services/index';
import { apiRoutes } from '@/constants';
import { Player } from '@prisma/client';

export const getUserPlayer = async (username: string) => {
  const { data } = await axiosInstance.get<Player>(apiRoutes.userPlayer, {
    params: { username },
  });

  return data;
};
