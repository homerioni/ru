import { apiRoutes } from '../constants';
import { axiosInstance } from './index';

type TUploadImageResponse = {
  contentDisposition: string;
  contentType: string;
  downloadUrl: string;
  pathname: string;
  url: string;
};

export const uploadImage = async (formData: FormData): Promise<TUploadImageResponse> => {
  const { data } = await axiosInstance.post(apiRoutes.upload, formData);

  return data;
};
