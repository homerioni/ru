import { SubmitHandler, useForm } from 'react-hook-form';
import { Grid, Input, Switch, Text, Textarea } from '@mantine/core';
import { modals } from '@mantine/modals';
import { LiveBroadcast } from '@prisma/client';
import { createBroadcast, updateBroadcast } from '@/services';
import { AdminEditModal } from '@/components/admin/modals/AdminEditModal';
import { generateJitsiRoomName } from '@/utils/parseStreamInput';

type TModalBroadcastProps = {
  data?: LiveBroadcast;
  refetch: () => void;
};

type TForm = {
  title: string;
  description: string;
  streamInput: string;
  jitsiRoomName: string;
  isActive: boolean;
};

export const ModalBroadcast = ({ data, refetch }: TModalBroadcastProps) => {
  const { register, handleSubmit, setValue, watch } = useForm<TForm>({
    defaultValues: {
      title: data?.title ?? '',
      description: data?.description ?? '',
      streamInput: data?.streamInput ?? '',
      jitsiRoomName: data?.jitsiRoomName ?? generateJitsiRoomName(),
      isActive: data?.isActive ?? false,
    },
  });

  const onSubmit: SubmitHandler<TForm> = async (values) => {
    const payload = {
      title: values.title,
      description: values.description || null,
      streamInput: values.streamInput,
      jitsiRoomName: values.jitsiRoomName.trim() || generateJitsiRoomName(),
      isActive: values.isActive,
    };

    if (data) {
      await updateBroadcast(data.id, payload);
    } else {
      await createBroadcast(payload);
    }

    refetch();
    modals.closeAll();
  };

  return (
    <AdminEditModal isCreate={!data} onSubmit={handleSubmit(onSubmit)}>
      <Grid.Col span={12}>
        <Input.Wrapper label="Заголовок" withAsterisk>
          <Input
            placeholder="Матч vs Смолевичи"
            {...register('title', { required: true })}
          />
        </Input.Wrapper>
      </Grid.Col>
      <Grid.Col span={12}>
        <Input.Wrapper label="Описание">
          <Textarea
            placeholder="Короткое описание эфира"
            minRows={2}
            {...register('description')}
          />
        </Input.Wrapper>
      </Grid.Col>
      <Grid.Col span={12}>
        <Input.Wrapper
          label="Ссылка на трансляцию"
          withAsterisk
          description="YouTube, Rutube, VK, Twitch, embed-ссылка или код iframe"
        >
          <Textarea
            placeholder="https://www.youtube.com/watch?v=... или <iframe src=...>"
            minRows={3}
            {...register('streamInput', { required: true })}
          />
        </Input.Wrapper>
      </Grid.Col>
      <Grid.Col span={12}>
        <Input.Wrapper
          label="Комната конференции (Jitsi)"
          description="Уникальное имя. Можно сгенерировать новое для каждого эфира"
        >
          <Input
            placeholder="rechutd-x7k2m9"
            {...register('jitsiRoomName', { required: true })}
          />
        </Input.Wrapper>
        <Text fz="xs" c="dimmed" mt={4}>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--blue)',
              cursor: 'pointer',
              padding: 0,
              font: 'inherit',
            }}
            onClick={() => setValue('jitsiRoomName', generateJitsiRoomName())}
          >
            Сгенерировать новое имя
          </button>
        </Text>
      </Grid.Col>
      <Grid.Col span={12}>
        <Switch
          label="Включить трансляцию на сайте"
          description="Только одна трансляция может быть активной"
          checked={watch('isActive')}
          onChange={(e) => setValue('isActive', e.currentTarget.checked)}
        />
      </Grid.Col>
    </AdminEditModal>
  );
};
