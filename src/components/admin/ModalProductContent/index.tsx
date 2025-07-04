import { useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Image from 'next/image';
import {
  Button,
  Center,
  Flex,
  Grid,
  Input,
  SegmentedControl,
  Select,
  Switch,
  Text,
  Textarea,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { Product } from '@prisma/client';
import {
  IconCheck,
  IconPhoto,
  IconQuestionMark,
  IconX,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import imageCompression from 'browser-image-compression';
import { slugify } from 'transliteration';
import { getCategories } from '@/services/categories';
import { createProduct, updateProduct } from '@/services/products';
import { uploadImage } from '@/services/upload';
import { getImagePreview } from '@/utils/getImagePreview';
import s from './styles.module.scss';

const stockInputs = [
  {
    label: (
      <Center>
        <IconQuestionMark style={{ display: 'block' }} size={22} />
      </Center>
    ),
    value: '2',
  },
  {
    label: (
      <Center>
        <IconCheck style={{ display: 'block' }} size={22} />
      </Center>
    ),
    value: '1',
  },
  {
    label: (
      <Center>
        <IconX style={{ display: 'block' }} size={22} />
      </Center>
    ),
    value: '0',
  },
];

type TModalProductContentProps = {
  data?: Product;
  refetch: () => void;
};

type TForm = Omit<Product, 'createdAt' | 'updateAt' | 'id' | 'linkName'>;

export const ModalProductContent = ({
  data,
  refetch,
}: TModalProductContentProps) => {
  const { register, handleSubmit, watch, setValue } = useForm<TForm>({
    defaultValues: data
      ? {
          stock: data.stock,
          imageUrl: data.imageUrl,
          name: data.name,
          price: data.price,
          description: data.description,
          popular: data.popular,
          categoryId: data.categoryId,
          fullPrice: data.fullPrice,
        }
      : {
          fullPrice: null,
          description: null,
        },
  });
  const [preview, setPreview] = useState<string | null>(data?.imageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stock = watch('stock');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  });

  const onSubmit: SubmitHandler<TForm> = async (product) => {
    if (!fileInputRef.current?.files?.[0] && !data?.imageUrl) {
      return;
    }

    const linkName = slugify(product.name);

    const imageFile = fileInputRef.current!.files![0];
    const compressedFile =
      imageFile &&
      (await imageCompression(imageFile, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      }));
    const imageData = new FormData();
    imageData.append('image', compressedFile);

    if (data) {
      if (imageFile) {
        setIsUploading(true);
        const imageUrl = await uploadImage(imageData)
          .then((res) => res.url)
          .finally(() => setIsUploading(false));
        updateProduct({
          ...data,
          ...product,
          price: product.price ?? 0,
          linkName: `${linkName}-${data.id}`,
          imageUrl,
        }).then(() => refetch());
      } else {
        updateProduct({
          ...data,
          ...product,
          price: product.price ?? 0,
          linkName: `${linkName}-${data.id}`,
        }).then(() => refetch());
      }
    } else {
      setIsUploading(true);
      const imageUrl = await uploadImage(imageData)
        .then((res) => res.url)
        .finally(() => setIsUploading(false));
      createProduct({
        ...product,
        price: product.price ?? 0,
        linkName,
        imageUrl,
      }).then(() => refetch());
    }

    modals.closeAll();
  };

  if (!categories) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid gutter={10}>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Text fw={500} fz="sm" lh={1.7} display="block">
            Изображение *
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
              <Input.Wrapper label="Наименование" withAsterisk>
                <Input
                  placeholder="Имя товара"
                  {...register('name', { required: true })}
                />
              </Input.Wrapper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              {categories && (
                <Select
                  data={categories.map((item) => ({
                    value: String(item.id),
                    label: item.name,
                  }))}
                  label="Категория"
                  withAsterisk
                  placeholder="Категория"
                  maxDropdownHeight={200}
                  searchable
                  allowDeselect={false}
                  {...register('categoryId', { required: true })}
                  onChange={(_, option) =>
                    setValue('categoryId', +option.value)
                  }
                  defaultValue={data ? String(data?.categoryId) : undefined}
                />
              )}
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <Input.Wrapper label="Цена" withAsterisk>
                <Input
                  placeholder="Цена"
                  type="number"
                  step={0.01}
                  {...register('price')}
                />
              </Input.Wrapper>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <Input.Wrapper label="Цена без скидки">
                <Input
                  placeholder="Без скидки"
                  type="number"
                  step={0.01}
                  {...register('fullPrice')}
                />
              </Input.Wrapper>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <Input.Wrapper label="Наличие">
                <SegmentedControl
                  display="flex"
                  w="fit-content"
                  size="xs"
                  color={
                    typeof stock === 'boolean'
                      ? ['red', 'green'][+stock]
                      : undefined
                  }
                  data={stockInputs}
                  defaultValue={
                    typeof data?.stock === 'boolean'
                      ? ['0', '1'][+data.stock]
                      : '2'
                  }
                  onChange={(val) => setValue('stock', [false, true][+val])}
                />
              </Input.Wrapper>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <Input.Wrapper label="Популярный">
                <Flex align="center" h={36}>
                  <Switch
                    {...register('popular')}
                    color="violet"
                    defaultChecked={data?.popular ?? false}
                  />
                </Flex>
              </Input.Wrapper>
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                {...register('description')}
                label="Описание"
                placeholder="Описание"
                autosize
                minRows={2}
                maxRows={6}
              />
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
