'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Center, Pagination, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { Product } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { EditableList } from '@/components/admin/EditableList';
import { EditableListSkeleton } from '@/components/admin/EditableList/skeleton';
import { ListControlPanel } from '@/components/admin/ListControlPanel';
import { ModalProductContent } from '@/components/admin/ModalProductContent';
import { useDebounce } from '@/hooks/useDebounce';
import { getProducts } from '@/services';
import { deleteProducts } from '@/services/products';

const columns = [
  { name: 'Изображение', width: 0 },
  { name: 'Наименование', width: 250 },
  { name: 'Категория', width: 150 },
  { name: 'Цена', width: 0 },
  { name: 'Без скидки', width: 90 },
  { name: 'Наличие', width: 0 },
  { name: 'Популярный', width: 0 },
] as const;

export default function AdminProductsPage() {
  const [selectedItems, setSelectedItems] = useState<Product[]>([]);

  const [search, setSearch] = useState('');
  const searchDebounce = useDebounce(search, 350);

  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['products', page, searchDebounce],
    queryFn: () =>
      getProducts({ qty: 50, search: searchDebounce || undefined, page }),
  });

  const productsList = useMemo(
    () =>
      data?.products.map((product) => ({
        product,
        tableData: [
          <Image
            src={product.imageUrl}
            alt=""
            width={64}
            height={64}
            style={{ objectFit: 'cover' }}
          />,
          product.name,
          product.category.name,
          +product.price,
          product.fullPrice && +product.fullPrice,
          product.stock,
          product.popular,
        ],
      })),
    [data]
  );

  const onDel = () =>
    modals.openConfirmModal({
      title: 'Вы уверены, что хотите удалить?',
      centered: true,
      children: (
        <Text>{selectedItems.map((product) => product.name).join(', ')}</Text>
      ),
      labels: { confirm: 'Да, удалить', cancel: 'Отменить' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteProducts(selectedItems.map((product) => product.id)).then(() =>
          refetch()
        );
        setSelectedItems([]);
      },
    });

  const onAdd = () =>
    modals.open({
      title: 'Новый товар',
      size: 'xl',
      children: <ModalProductContent refetch={refetch} />,
    });

  const onEdit = () => {
    modals.open({
      title: `Редактирование "${selectedItems[0]?.name}"`,
      size: 'xl',
      children: (
        <ModalProductContent data={selectedItems[0]} refetch={refetch} />
      ),
    });
    setSelectedItems([]);
  };

  return (
    <Stack gap={10}>
      <ListControlPanel
        selectedLength={selectedItems.length}
        searchState={[search, setSearch]}
        onAdd={onAdd}
        onEdit={onEdit}
        onDel={onDel}
      />
      {isLoading && <EditableListSkeleton />}
      {!isLoading && productsList && (
        <EditableList
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          columns={columns}
          data={productsList}
        />
      )}
      {data?.totalPages && data?.totalPages > 1 && (
        <Center>
          <Pagination
            total={data.totalPages}
            value={page}
            onChange={(num) => setPage(num)}
          />
        </Center>
      )}
    </Stack>
  );
}
