import imageCompression from 'browser-image-compression';

export const getCompressionImage = async (file?: File) => {
  if (!file) {
    return null;
  }

  const compressedFile =
    file &&
    (await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    }));

  const imageData = new FormData();
  imageData.append('image', compressedFile);

  return imageData;
};
