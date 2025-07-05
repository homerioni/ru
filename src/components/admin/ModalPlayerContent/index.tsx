import { useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Image from 'next/image';
import { Button, Flex, Grid, Input, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { Player } from '@prisma/client';
import { IconPhoto } from '@tabler/icons-react';
import imageCompression from 'browser-image-compression';
import { uploadImage } from '@/services/upload';
import { getImagePreview } from '@/utils/getImagePreview';
import { createPlayer, updatePlayer } from '@/services';
import s from './styles.module.scss';

type TModalProductContentProps = {
  data?: Player;
  refetch: () => void;
};

type TForm = Omit<Player, 'createdAt' | 'updateAt' | 'id'>;

export const ModalPlayerContent = ({
  data,
  refetch,
}: TModalProductContentProps) => {
  const { register, handleSubmit } = useForm<TForm>({
    defaultValues: data ?? {},
  });
  const [preview, setPreview] = useState<string | null>(data?.photo || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit: SubmitHandler<TForm> = async (player) => {
    if (!fileInputRef.current?.files?.[0] && !data?.photo) {
      return;
    }

    player.number = +player.number;

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
        const photo = await uploadImage(imageData)
          .then((res) => res.url)
          .finally(() => setIsUploading(false));
        updatePlayer({
          ...data,
          ...player,
          photo,
        }).then(() => refetch());
      } else {
        updatePlayer({
          ...data,
          ...player,
        }).then(() => refetch());
      }
    } else {
      setIsUploading(true);
      const photo = await uploadImage(imageData)
        .then((res) => res.url)
        .finally(() => setIsUploading(false));
      createPlayer({ ...player, photo }).then(() => refetch());
    }

    modals.closeAll();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid gutter={10}>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Text fw={500} fz="sm" lh={1.7} display="block">
            Фото *
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
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Input.Wrapper label="Имя" withAsterisk>
                <Input
                  placeholder="Имя"
                  {...register('name', { required: true })}
                />
              </Input.Wrapper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Input.Wrapper label="Позиция" withAsterisk>
                <Input
                  placeholder="Позиция"
                  {...register('position', { required: true })}
                />
              </Input.Wrapper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
              <Input.Wrapper label="Номер игрока" withAsterisk>
                <Input
                  placeholder="Номер"
                  type="number"
                  step={1}
                  {...register('number', { required: true })}
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
