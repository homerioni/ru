import { axiosInstance } from '@/services/index';
import { apiRoutes } from '@/constants';

type Top = {
  points: number;
  name: string;
  image: string;
};

export const getTop = async () => {
  const { data } = await axiosInstance.get<Top[]>(apiRoutes.top);

  return data;
};
