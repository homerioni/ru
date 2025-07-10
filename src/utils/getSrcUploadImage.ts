import { uploadImage } from '@/services';
import { Dispatch, SetStateAction } from 'react';
import { getCompressionImage } from '@/utils/getCompressionImage';

export const getSrcUploadImage = async (
  file?: File,
  setter?: Dispatch<SetStateAction<boolean>>
) => {
  const imageData = await getCompressionImage(file);

  if (!imageData) {
    return null;
  }

  setter?.(true);

  return await uploadImage(imageData)
    .then((res) => res.url)
    .finally(() => setter?.(false));
};
