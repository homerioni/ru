import { Product } from '@prisma/client';
import { apiRoutes } from '../constants';
import { CreateProductData, TProduct } from '../types';
import { axiosInstance } from './index';

type TGetProductsProps = {
  search?: string;
  category?: number;
  stock?: boolean;
  qty?: number;
  popular?: boolean;
  page?: string | number;
};

type TGetProductsResponse = {
  products: TProduct[];
  totalCount: number;
  activePage: number;
  totalPages: number;
};

export const getProducts = async (params?: TGetProductsProps) => {
  const { data } = await axiosInstance.get<TGetProductsResponse>(apiRoutes.products, { params });

  return data;
};

export const getProduct = async (id: number | string) => {
  const { data } = await axiosInstance.get<TProduct>(apiRoutes.product, { params: { id } });

  return data;
};

export const deleteProducts = async (ids: number[]) => {
  const { data } = await axiosInstance.delete(apiRoutes.products, {
    params: { ids: ids.join(',') },
  });

  return data;
};

export const createProduct = async (product: CreateProductData) => {
  const { data } = await axiosInstance.post(apiRoutes.product, product);

  return data;
};

export const updateProduct = async (product: Product) => {
  const { data } = await axiosInstance.post(apiRoutes.updateProduct, product);

  return data;
};
