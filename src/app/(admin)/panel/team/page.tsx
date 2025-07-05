'use client';

import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import Image from 'next/image';
import { Center, Pagination, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { Player } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { EditableList, TEditableItem } from '@/components/admin/EditableList';
import { EditableListSkeleton } from '@/components/admin/EditableList/skeleton';
import { ListControlPanel } from '@/components/admin/ListControlPanel';
import { ModalPlayerContent } from '@/components/admin/ModalPlayerContent';
import { useDebounce } from '@/hooks/useDebounce';
import { deletePlayers, getPlayers } from '@/services';

const columns = [
  { name: 'Фото', width: '0%' },
  { name: 'Номер', width: '0%' },
  { name: 'Имя', width: 0 },
  { name: 'Позиция', width: 0 },
] as const;

export default function AdminProductsPage() {
  const [selectedItems, setSelectedItems] = useState<Player[]>([]);

  const [search, setSearch] = useState('');
  const searchDebounce = useDebounce(search, 350);

  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['players', page, searchDebounce],
    queryFn: () =>
      getPlayers({ qty: 50, search: searchDebounce || undefined, page }),
  });

  const playersList = useMemo(
    () =>
      data?.players.map((player) => {
        console.log(player);

        return {
          data: player,
          tableData: [
            <Image
              key={player.id}
              src={player.photo}
              alt=""
              width={64}
              height={64}
              style={{ objectFit: 'cover' }}
            />,
            player.number,
            player.name,
            player.position,
          ],
        };
      }),
    [data]
  );

  const onDel = () =>
    modals.openConfirmModal({
      title: 'Вы уверены, что хотите удалить?',
      centered: true,
      children: (
        <Text>{selectedItems.map((player) => player.name).join(', ')}</Text>
      ),
      labels: { confirm: 'Да, удалить', cancel: 'Отменить' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deletePlayers(selectedItems.map((player) => player.id)).then(() =>
          refetch()
        );
        setSelectedItems([]);
      },
    });

  const onAdd = () =>
    modals.open({
      title: 'Новый игрок',
      size: 'xl',
      children: <ModalPlayerContent refetch={refetch} />,
    });

  const onEdit = () => {
    modals.open({
      title: `Редактирование "${selectedItems[0]?.name}"`,
      size: 'xl',
      children: (
        <ModalPlayerContent data={selectedItems[0]} refetch={refetch} />
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
      {!isLoading && playersList && (
        <EditableList
          selectedItems={selectedItems}
          setSelectedItems={
            setSelectedItems as Dispatch<SetStateAction<TEditableItem[]>>
          }
          columns={columns}
          data={playersList}
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
