import { ClubPhoto } from '@prisma/client';
import { apiRoutes } from '@/constants';
import { axiosInstance } from './index';

export const getClubPhotos = async (clubId: number) => {
  const { data } = await axiosInstance.get<{ photos: ClubPhoto[] }>(
    `${apiRoutes.clubPhotos}?clubId=${clubId}`
  );

  return data.photos;
};

export const getClubPhotosAll = async (clubId: number) => {
  const { data } = await axiosInstance.get<{ photos: ClubPhoto[] }>(
    `${apiRoutes.clubPhotos}?clubId=${clubId}&all=1`
  );

  return data.photos;
};

type TCreateClubPhoto = Pick<
  ClubPhoto,
  'clubId' | 'imageSrc' | 'caption' | 'sortOrder' | 'isPublished'
>;

type TCreateClubPhotosBatch = {
  clubId: number;
  photos: Pick<ClubPhoto, 'imageSrc' | 'caption' | 'sortOrder' | 'isPublished'>[];
};

export const createClubPhoto = async (payload: TCreateClubPhoto) => {
  const { data } = await axiosInstance.post<ClubPhoto>(
    apiRoutes.clubPhotos,
    payload
  );

  return data;
};

export const createClubPhotos = async (payload: TCreateClubPhotosBatch) => {
  const { data } = await axiosInstance.post<{ photos: ClubPhoto[] }>(
    apiRoutes.clubPhotos,
    payload
  );

  return data.photos;
};

export const updateClubPhoto = async (
  id: number,
  payload: Partial<Omit<TCreateClubPhoto, 'clubId'>>
) => {
  const { data } = await axiosInstance.patch<ClubPhoto>(
    `${apiRoutes.clubPhotos}/${id}`,
    payload
  );

  return data;
};

export const deleteClubPhotos = async (ids: number[]) => {
  await axiosInstance.delete(apiRoutes.clubPhotos, { data: { ids } });
};
