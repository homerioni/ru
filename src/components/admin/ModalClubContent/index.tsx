import { useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Image from 'next/image';
import { Button, Flex, Grid, Input, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { Club } from '@prisma/client';
import { IconPhoto } from '@tabler/icons-react';
import imageCompression from 'browser-image-compression';
import { uploadImage } from '@/services/upload';
import { getImagePreview } from '@/utils/getImagePreview';
import { createClub, updateClub } from '@/services';
import s from './styles.module.scss';

type TModalClubContentProps = {
  data?: Club;
  refetch: () => void;
};

type TForm = Omit<Club, 'createdAt' | 'updateAt' | 'id'>;

export const ModalClubContent = ({ data, refetch }: TModalClubContentProps) => {
  const { register, handleSubmit } = useForm<TForm>({
    defaultValues: data ?? {},
  });
  const [preview, setPreview] = useState<string | null>(data?.logoSrc || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit: SubmitHandler<TForm> = async (club) => {
    if (!fileInputRef.current?.files?.[0] && !data?.logoSrc) {
      return;
    }

    const imageFile = fileInputRef.current!.files![0];
    const compressedFile =
      imageFile &&
      (await imageCompression(imageFile, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      }));
    const imageData = new FormData();
    imageData.append('image', compressedFile);

    if (data) {
      if (imageFile) {
        setIsUploading(true);
        const logoSrc = await uploadImage(imageData)
          .then((res) => res.url)
          .finally(() => setIsUploading(false));
        updateClub({
          ...data,
          ...club,
          logoSrc,
        }).then(() => refetch());
      } else {
        updateClub({
          ...data,
          ...club,
        }).then(() => refetch());
      }
    } else {
      setIsUploading(true);
      const logoSrc = await uploadImage(imageData)
        .then((res) => res.url)
        .finally(() => setIsUploading(false));
      createClub({ ...club, logoSrc }).then(() => refetch());
    }

    modals.closeAll();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid gutter={10}>
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
          <Grid gutter={10}>
            <Grid.Col span={{ base: 12, sm: 12 }}>
              <Input.Wrapper label="Название" withAsterisk>
                <Input
                  placeholder="Имя"
                  {...register('name', { required: true })}
                />
              </Input.Wrapper>
            </Grid.Col>
          </Grid>
        </Grid.Col>
        <Grid.Col span={12} style={{ marginTop: '1rem' }}>
          <Flex gap={5}>
            <Button
              type="submit"
              variant="outline"
              color={data ? undefined : 'green'}
              loading={isUploading}
            >
              {data ? 'Сохранить' : 'Создать'}
            </Button>
            <Button
              type="button"
              variant="transparent"
              color="gray"
              onClick={() => modals.closeAll()}
              disabled={isUploading}
            >
              Отменить
            </Button>
          </Flex>
        </Grid.Col>
      </Grid>
    </form>
  );
};
