import { useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Image from 'next/image';
import { Flex, Grid, Input, Switch, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { Player } from '@prisma/client';
import { IconPhoto } from '@tabler/icons-react';
import { getImagePreview } from '@/utils/getImagePreview';
import { createPlayer, updatePlayer } from '@/services';
import { getSrcUploadImage } from '@/utils/getSrcUploadImage';
import { AdminEditModal } from '@/components/admin/modals/AdminEditModal';
import s from './styles.module.scss';

type TModalPlayerContentProps = {
  data?: Player;
  refetch: () => void;
};

type TForm = Omit<Player, 'createdAt' | 'updateAt' | 'id'> & {
  isShow: boolean;
};

export const ModalPlayerContent = ({
  data,
  refetch,
}: TModalPlayerContentProps) => {
  const { register, handleSubmit } = useForm<TForm>({
    defaultValues: data ?? {},
  });
  const [preview, setPreview] = useState<string | null>(data?.photo || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit: SubmitHandler<TForm> = async (player) => {
    const imageFile = fileInputRef.current?.files?.[0];

    if (!imageFile && !data?.photo) {
      return;
    }

    const photo = await getSrcUploadImage(imageFile, setIsUploading);

    if (data) {
      updatePlayer({
        ...data,
        ...player,
        photo: photo ?? data.photo,
      }).then(() => refetch());
    } else {
      createPlayer({ ...player, photo: photo!, number: +player.number }).then(
        () => refetch()
      );
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
          <Grid.Col span={{ base: 3, sm: 2 }}>
            <Input.Wrapper label="Показывать?">
              <Flex align="center" h={36}>
                <Switch
                  {...register('isShow')}
                  color="violet"
                  defaultChecked={data?.isShow ?? false}
                />
              </Flex>
            </Input.Wrapper>
          </Grid.Col>
        </Grid>
      </Grid.Col>
    </AdminEditModal>
  );
};
