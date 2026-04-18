import { Player, Transfer, Club } from '@prisma/client';
import { apiRoutes } from '@/constants';
import { axiosInstance } from './index';

type TGetTransfersProps = {
  qty?: number;
  page?: string | number;
  clubId?: number;
  clubAdminId?: number;
};

export type TGetTransfer = Transfer & {
  player: Player & {
    club: Club | null;
    playedIn: {
      goals: number;
      assists: number;
      match: { type: { id: number } };
    }[];
  };
  fromClub: Club | null;
  toClub: Club | null;
};

type TGetTransfersResponse = {
  transfers: TGetTransfer[];
  totalCount: number;
  activePage: number;
  totalPages: number;
};

export const getTransfers = async (params?: TGetTransfersProps) => {
  const { data } = await axiosInstance.get<TGetTransfersResponse>(
    apiRoutes.transfers,
    {
      params,
    }
  );

  return data;
};

export const deleteTransfers = async (ids: number[]) => {
  const { data } = await axiosInstance.delete(apiRoutes.transfers, {
    params: { ids: ids.join(',') },
  });

  return data;
};

// Omit id for creation, or use a specific type if available
export const createTransfer = async (
  transfer: Omit<Transfer, 'id' | 'createdAt' | 'updateAt'>,
  isPlayerUpdate?: boolean
) => {
  const { data } = await axiosInstance.post(apiRoutes.transfers, {
    ...transfer,
    isPlayerUpdate,
  });

  return data;
};

export const updateTransfer = async (
  transfer: Omit<Transfer, 'createdAt' | 'updateAt'>,
  isPlayerUpdate?: boolean
) => {
  const { data } = await axiosInstance.post(apiRoutes.transfers, {
    ...transfer,
    isPlayerUpdate,
  });

  return data;
};
