'use client';

import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import Image from 'next/image';
import { Center, Pagination, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { Club } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { EditableList, TEditableItem } from '@/components/admin/EditableList';
import { EditableListSkeleton } from '@/components/admin/EditableList/skeleton';
import { ListControlPanel } from '@/components/admin/ListControlPanel';
import { useDebounce } from '@/hooks/useDebounce';
import { deleteClubs, getClubs } from '@/services';
import { ModalClubContent } from '@/components/admin/ModalClubContent';

const columns = [
  { name: 'Логотип', width: '0%' },
  { name: 'Название', width: 0 },
] as const;

export default function AdminClubsPage() {
  const [selectedItems, setSelectedItems] = useState<Club[]>([]);

  const [search, setSearch] = useState('');
  const searchDebounce = useDebounce(search, 350);

  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['clubs', page, searchDebounce],
    queryFn: () =>
      getClubs({ qty: 50, search: searchDebounce || undefined, page }),
  });

  console.log(data);

  const clubsList = useMemo(
    () =>
      data?.clubs.map((club) => ({
        data: club,
        tableData: [
          <Image
            key={club.id}
            src={club.logoSrc}
            alt=""
            width={64}
            height={64}
            style={{ objectFit: 'cover' }}
          />,
          club.name,
        ],
      })),
    [data]
  );

  const onDel = () =>
    modals.openConfirmModal({
      title: 'Вы уверены, что хотите удалить?',
      centered: true,
      children: (
        <Text>{selectedItems.map((club) => club.name).join(', ')}</Text>
      ),
      labels: { confirm: 'Да, удалить', cancel: 'Отменить' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteClubs(selectedItems.map((club) => club.id)).then(() => refetch());
        setSelectedItems([]);
      },
    });

  const onAdd = () =>
    modals.open({
      title: 'Новая команда',
      size: 'xl',
      children: <ModalClubContent refetch={refetch} />,
    });

  const onEdit = () => {
    modals.open({
      title: `Редактирование "${selectedItems[0]?.name}"`,
      size: 'xl',
      children: <ModalClubContent data={selectedItems[0]} refetch={refetch} />,
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
      {!isLoading && clubsList && (
        <EditableList
          selectedItems={selectedItems}
          setSelectedItems={
            setSelectedItems as Dispatch<SetStateAction<TEditableItem[]>>
          }
          columns={columns}
          data={clubsList}
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
