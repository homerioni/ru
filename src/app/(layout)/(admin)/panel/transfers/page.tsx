'use client';

import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { Center, Pagination, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useQuery } from '@tanstack/react-query';
import { EditableList, TEditableItem } from '@/components/admin/EditableList';
import { EditableListSkeleton } from '@/components/admin/EditableList/skeleton';
import { ListControlPanel } from '@/components/admin/ListControlPanel';
import { deleteTransfers, getTransfers } from '@/services';
import { ModalTransfer } from '@/components/admin/modals/ModalTransfer';
import { TGetTransfer } from '@/services/transfers';
import Image from 'next/image';
import defaultPlayerImg from '@/assets/img/player-default.webp';

const columns = [
  { name: 'Фото', width: 0 },
  { name: 'Игрок', width: '15%' },
  { name: 'Откуда', width: '15%' },
  { name: 'Куда', width: '15%' },
  { name: 'Дата', width: '55%' },
] as const;

export default function AdminTransfersPage() {
  const [selectedItems, setSelectedItems] = useState<TGetTransfer[]>([]);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['transfers', page],
    queryFn: () => getTransfers({ qty: 50, page }),
  });

  const transfersList = useMemo(
    () =>
      data?.transfers.map((transfer) => ({
        data: transfer,
        tableData: [
          <Image
            key={transfer.id}
            src={transfer.player?.photo ?? defaultPlayerImg}
            alt=""
            width={64}
            height={64}
            style={{ objectFit: 'cover' }}
          />,
          transfer.player?.name || 'Неизвестный игрок',
          transfer.fromClub?.name || '-',
          transfer.toClub?.name || '-',
          new Date(transfer.date).toLocaleDateString(),
        ],
      })),
    [data]
  );

  const onDel = () =>
    modals.openConfirmModal({
      title: 'Вы уверены, что хотите удалить?',
      centered: true,
      children: <Text>Выбранные трансферы будут удалены.</Text>,
      labels: { confirm: 'Да, удалить', cancel: 'Отменить' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteTransfers(selectedItems.map((transfer) => transfer.id)).then(() =>
          refetch()
        );
        setSelectedItems([]);
      },
    });

  const onAdd = () =>
    modals.open({
      title: 'Новый трансфер',
      size: 'xl',
      children: <ModalTransfer refetch={refetch} />,
    });

  const onEdit = () => {
    modals.open({
      title: `Редактирование трансфера`,
      size: 'xl',
      children: <ModalTransfer data={selectedItems[0]} refetch={refetch} />,
    });
    setSelectedItems([]);
  };

  return (
    <Stack gap={10}>
      <ListControlPanel
        selectedLength={selectedItems.length}
        onAdd={onAdd}
        onEdit={onEdit}
        onDel={onDel}
      />
      {isLoading && <EditableListSkeleton />}
      {!isLoading && transfersList && (
        <EditableList
          selectedItems={selectedItems}
          setSelectedItems={
            setSelectedItems as Dispatch<SetStateAction<TEditableItem[]>>
          }
          columns={columns}
          data={transfersList}
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
