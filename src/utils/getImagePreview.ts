import { ChangeEvent } from 'react';

export const getImagePreview = (
  e: ChangeEvent<HTMLInputElement>,
  setter: (file: string) => void
) => {
  const file = e.target.files?.[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    setter(reader.result as string);
  };
  reader.readAsDataURL(file);
};
