import { ClubAdminRequestLog } from '@prisma/client';
import { apiRoutes } from '@/constants';
import { axiosInstance } from './index';

type TGetAdminRequestLogsProps = {
  qty?: number;
  page?: number;
  search?: string;
};

type TGetAdminRequestLogsResponse = {
  logs: ClubAdminRequestLog[];
  totalCount: number;
  activePage: number;
  totalPages: number;
};

export const getAdminRequestLogs = async (params?: TGetAdminRequestLogsProps) => {
  const { data } = await axiosInstance.get<TGetAdminRequestLogsResponse>(
    apiRoutes.adminRequestLogs,
    {
      params,
    }
  );

  return data;
};
