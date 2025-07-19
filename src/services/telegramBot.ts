import { TMessageTg } from '@/types';
import { axiosInstance } from '@/services/index';
import { apiRoutes } from '@/constants';

export const postMessageTgBot = async (postData: TMessageTg) => {
  const { data } = await axiosInstance.post(apiRoutes.tg, postData);

  return data;
};
