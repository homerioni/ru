import { useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Image from 'next/image';
import { Grid, Input, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { Club } from '@prisma/client';
import { IconPhoto } from '@tabler/icons-react';
import { getImagePreview } from '@/utils/getImagePreview';
import { createClub, updateClub } from '@/services';
import s from './styles.module.scss';
import { AdminEditModal } from '@/components/admin/modals/AdminEditModal';
import { getSrcUploadImage } from '@/utils/getSrcUploadImage';

type TModalClubProps = {
  data?: Club;
  refetch: () => void;
};

type TForm = Omit<Club, 'createdAt' | 'updateAt' | 'id'>;

export const ModalClub = ({ data, refetch }: TModalClubProps) => {
  const { register, handleSubmit } = useForm<TForm>({
    defaultValues: data ?? {},
  });
  const [preview, setPreview] = useState<string | null>(data?.logoSrc || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit: SubmitHandler<TForm> = async (club) => {
    const imageFile = fileInputRef.current?.files?.[0];

    if (!imageFile && !data?.logoSrc) {
      return;
    }

    const logoSrc = await getSrcUploadImage(imageFile, setIsUploading);

    if (data) {
      updateClub({
        ...data,
        ...club,
        logoSrc: logoSrc ?? data.logoSrc,
      }).then(() => refetch());
    } else {
      createClub({ ...club, logoSrc: logoSrc! }).then(() => refetch());
    }

    modals.closeAll();
  };

  return (
    <AdminEditModal
      isCreate={!data}
      onSubmit={handleSubmit(onSubmit)}
      isDisabledSubmit={isUploading}
    >
      <Grid.Col span={{ base: 12, sm: 3 }}>
        <Text fw={500} fz="sm" lh={1.7} display="block">
          Логотип *
        </Text>
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
            <IconPhoto size={64} stroke={1} color="var(--imageColor)" />
          )}
        </label>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 9 }}>
        <Input.Wrapper label="Название" withAsterisk>
          <Input placeholder="Имя" {...register('name', { required: true })} />
        </Input.Wrapper>
      </Grid.Col>
    </AdminEditModal>
  );
};
