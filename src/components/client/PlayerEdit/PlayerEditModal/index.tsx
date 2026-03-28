'use client';

import { Modal } from '@ui/Modal';
import { SubmitHandler, useForm } from 'react-hook-form';
import s from './styles.module.scss';
import { getImagePreview } from '@/utils/getImagePreview';
import Image from 'next/image';
import { IconPhoto, IconEdit } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import { getSrcUploadImage } from '@/utils/getSrcUploadImage';
import { updateProfilePlayer } from '@/services';
import { TGetPlayer } from '@/types';
import { Button } from '@ui/Button';
import {
  InstagramIcon,
  TelegramIcon,
  TiktokIcon,
  VkIcon,
  YoutubeIcon,
} from '@ui/Icons';

type TForm = {
  photo: string | null;
  telegram: string | null;
  tiktok: string | null;
  vk: string | null;
  youtube: string | null;
  instagram: string | null;
};

export const PlayerEditModal = ({
  playerData,
  onClose,
}: {
  playerData: TGetPlayer;
  onClose: () => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    playerData.photo ?? null
  );
  const [isDisabled, setIsDisabled] = useState(false);

  const { register, handleSubmit } = useForm<TForm>({
    defaultValues: {
      photo: playerData.photo ?? '',
      telegram: playerData.telegram ?? '',
      tiktok: playerData.tiktok ?? '',
      vk: playerData.vk ?? '',
      youtube: playerData.youtube ?? '',
      instagram: playerData.instagram ?? '',
    },
  });

  const onSubmit: SubmitHandler<TForm> = async (newData) => {
    if (isDisabled) {
      return;
    }

    setIsDisabled(true);

    const imageFile = fileInputRef.current?.files?.[0];

    const photo = await getSrcUploadImage(imageFile);

    updateProfilePlayer({
      ...playerData,
      ...newData,
      photo: imageFile ? photo : playerData.photo,
    })
      .then(() => location.reload())
      .catch(() => setIsDisabled(false));
  };

  return (
    <Modal closeHandler={onClose}>
      <h3 className={s.title}>Редактирование профиля</h3>
      <div className={s.form}>
        <div className={s.photo}>
          <label className={`${s.imageUpload} ${preview ? s.active : ''}`}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => getImagePreview(e, setPreview)}
              accept="image/*"
            />
            {preview ? (
              <Image src={preview} alt="Preview" width={360} height={360} />
            ) : (
              <IconPhoto size={64} stroke={1} color="var(--text-primary)" />
            )}
            {preview && <IconEdit className={s.editIcon} />}
          </label>
        </div>
        <label className={s.inputWrapper}>
          <TelegramIcon />
          <input
            type="text"
            placeholder="Ссылка на telegram"
            {...register('telegram')}
          />
        </label>
        <label className={s.inputWrapper}>
          <InstagramIcon />
          <input
            type="text"
            placeholder="Ссылка на instagram"
            {...register('instagram')}
          />
        </label>
        <label className={s.inputWrapper}>
          <TiktokIcon />
          <input
            type="text"
            placeholder="Ссылка на tiktok"
            {...register('tiktok')}
          />
        </label>
        <label className={s.inputWrapper}>
          <YoutubeIcon />
          <input
            type="text"
            placeholder="Ссылка на youtube"
            {...register('youtube')}
          />
        </label>
        <label className={s.inputWrapper}>
          <VkIcon />
          <input type="text" placeholder="Ссылка на vk" {...register('vk')} />
        </label>
        <div className={s.buttons}>
          <Button onClick={onClose} variant="secondary">
            Закрыть
          </Button>
          <Button onClick={handleSubmit(onSubmit)}>Сохранить</Button>
        </div>
      </div>
    </Modal>
  );
};
