import { SiteUpdate } from '@prisma/client';
import { apiRoutes } from '@/constants';
import { axiosInstance } from './index';

export const getSiteUpdates = async () => {
  const { data } = await axiosInstance.get<{ updates: SiteUpdate[] }>(
    apiRoutes.siteUpdates
  );

  return data.updates;
};

export const getSiteUpdatesAll = async () => {
  const { data } = await axiosInstance.get<{ updates: SiteUpdate[] }>(
    `${apiRoutes.siteUpdates}?all=1`
  );

  return data.updates;
};

type TCreateSiteUpdate = Pick<
  SiteUpdate,
  'title' | 'description' | 'sortOrder' | 'isPublished' | 'imageSrcs'
>;

export const createSiteUpdate = async (payload: TCreateSiteUpdate) => {
  const { data } = await axiosInstance.post<SiteUpdate>(
    apiRoutes.siteUpdates,
    payload
  );

  return data;
};

export const updateSiteUpdate = async (
  id: string,
  payload: Partial<TCreateSiteUpdate>
) => {
  const { data } = await axiosInstance.patch<SiteUpdate>(
    `${apiRoutes.siteUpdates}/${id}`,
    payload
  );

  return data;
};

export const deleteSiteUpdates = async (ids: string[]) => {
  await Promise.all(
    ids.map((id) => axiosInstance.delete(`${apiRoutes.siteUpdates}/${id}`))
  );
};
