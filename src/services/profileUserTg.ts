import { TProfileRequestTg } from '@/types';
import { axiosInstance } from '@/services/index';
import { apiRoutes } from '@/constants';

export const profileRequestTgBot = async (postData: TProfileRequestTg) => {
  const { data } = await axiosInstance.post(apiRoutes.tgProfile, postData);

  return data;
};
