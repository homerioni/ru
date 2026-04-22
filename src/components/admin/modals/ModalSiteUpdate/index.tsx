import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Image from 'next/image';
import {
  ActionIcon,
  Grid,
  Group,
  Input,
  NumberInput,
  Switch,
  Text,
  Textarea,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { SiteUpdate } from '@prisma/client';
import { IconPhoto, IconTrash } from '@tabler/icons-react';
import { createSiteUpdate, updateSiteUpdate } from '@/services';
import { AdminEditModal } from '@/components/admin/modals/AdminEditModal';
import { getSrcUploadImage } from '@/utils/getSrcUploadImage';
import s from './styles.module.scss';

type TModalSiteUpdateProps = {
  data?: SiteUpdate;
  refetch: () => void;
};

type TForm = {
  title: string;
  description: string;
  sortOrder: number;
  isPublished: boolean;
};

type ImageSlot =
  | { key: string; kind: 'remote'; url: string }
  | { key: string; kind: 'local'; file: File; preview: string };

function slotsFromData(row?: SiteUpdate): ImageSlot[] {
  if (!row?.imageSrcs?.length) return [];
  return row.imageSrcs.map((url, i) => ({
    key: `r-${i}-${url.slice(-24)}`,
    kind: 'remote' as const,
    url,
  }));
}

export const ModalSiteUpdate = ({ data, refetch }: TModalSiteUpdateProps) => {
  const { register, handleSubmit, setValue, watch } = useForm<TForm>({
    defaultValues: {
      title: data?.title ?? '',
      description: data?.description ?? '',
      sortOrder: data?.sortOrder ?? 0,
      isPublished: data?.isPublished ?? true,
    },
  });

  const [slots, setSlots] = useState<ImageSlot[]>(() => slotsFromData(data));
  const [isUploading, setIsUploading] = useState(false);
  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  useEffect(() => {
    return () => {
      slotsRef.current.forEach((slot) => {
        if (slot.kind === 'local') URL.revokeObjectURL(slot.preview);
      });
    };
  }, []);

  const removeSlot = (key: string) => {
    setSlots((prev) => {
      const slot = prev.find((s) => s.key === key);
      if (slot?.kind === 'local') {
        URL.revokeObjectURL(slot.preview);
      }
      return prev.filter((s) => s.key !== key);
    });
  };

  const onFilesSelected = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const next: ImageSlot[] = [];
    for (let i = 0; i < fileList.length; i += 1) {
      const file = fileList[i];
      if (!file.type.startsWith('image/')) continue;
      const preview = URL.createObjectURL(file);
      next.push({
        key: `l-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
        kind: 'local',
        file,
        preview,
      });
    }
    if (next.length) setSlots((prev) => [...prev, ...next]);
  };

  const onSubmit: SubmitHandler<TForm> = async (values) => {
    const imageSrcs: string[] = [];

    for (const slot of slots) {
      if (slot.kind === 'remote') {
        imageSrcs.push(slot.url);
      } else {
        const url = await getSrcUploadImage(slot.file, setIsUploading);
        if (url) imageSrcs.push(url);
      }
    }

    const payload = {
      title: values.title,
      description: values.description,
      sortOrder: values.sortOrder,
      isPublished: values.isPublished,
      imageSrcs,
    };

    if (data) {
      await updateSiteUpdate(data.id, payload);
    } else {
      await createSiteUpdate(payload);
    }

    refetch();
    modals.closeAll();
  };

  return (
    <AdminEditModal
      isCreate={!data}
      onSubmit={handleSubmit(onSubmit)}
      isDisabledSubmit={isUploading}
    >
      <Grid.Col span={12}>
        <Input.Wrapper label="Заголовок" withAsterisk>
          <Input placeholder="Заголовок" {...register('title', { required: true })} />
        </Input.Wrapper>
      </Grid.Col>
      <Grid.Col span={12}>
        <Input.Wrapper label="Описание" withAsterisk>
          <Textarea
            placeholder="Текст объявления"
            minRows={4}
            {...register('description', { required: true })}
          />
        </Input.Wrapper>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <NumberInput
          label="Порядок"
          description="Меньше — показывается раньше"
          min={0}
          value={watch('sortOrder')}
          onChange={(v) => setValue('sortOrder', typeof v === 'number' ? v : 0)}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Switch
          label="Опубликовано"
          mt="xl"
          checked={watch('isPublished')}
          onChange={(e) => setValue('isPublished', e.currentTarget.checked)}
        />
      </Grid.Col>
      <Grid.Col span={12}>
        <Text fw={500} fz="sm" lh={1.7} display="block" mb="xs">
          Изображения
        </Text>
        <Text fz="xs" c="dimmed" mb="sm">
          Можно выбрать несколько файлов. Порядок на сайте совпадает с порядком здесь.
        </Text>
        <label className={s.addImagesBtn}>
          <IconPhoto size={20} stroke={1.5} />
          Добавить файлы…
          <input
            type="file"
            accept="image/*"
            multiple
            className={s.fileInput}
            onChange={(e) => {
              onFilesSelected(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
        {slots.length > 0 ? (
          <Group gap="sm" wrap="wrap" mt="md">
            {slots.map((slot) => {
              const src = slot.kind === 'remote' ? slot.url : slot.preview;
              return (
                <div key={slot.key} className={s.thumbWrap}>
                  <Image
                    src={src}
                    alt=""
                    width={96}
                    height={96}
                    className={s.thumbImg}
                    unoptimized={slot.kind === 'local'}
                  />
                  <ActionIcon
                    type="button"
                    variant="filled"
                    color="red"
                    size="sm"
                    radius="xl"
                    className={s.thumbRemove}
                    onClick={() => removeSlot(slot.key)}
                    aria-label="Удалить"
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </div>
              );
            })}
          </Group>
        ) : (
          <Text fz="sm" c="dimmed" mt="xs">
            Пока без изображений — необязательно.
          </Text>
        )}
      </Grid.Col>
    </AdminEditModal>
  );
};
