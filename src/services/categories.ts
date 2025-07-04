import { apiRoutes } from '../constants';
import { TGetCategoriesResponse } from '../types';
import { axiosInstance } from './index';

export const getCategories = async () => {
  const { data } = await axiosInstance.get<TGetCategoriesResponse[]>(apiRoutes.categories);

  return data;
};

type TGetCategoryProps =
  | { id: string | number; linkName?: never }
  | { linkName: string; id?: never };

export const getCategory = async (params: TGetCategoryProps) => {
  const { data } = await axiosInstance.get<TGetCategoriesResponse>(apiRoutes.category, { params });

  return data;
};
