'use client';

import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import Image from 'next/image';
import { Center, Pagination, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useQuery } from '@tanstack/react-query';
import { EditableList, TEditableItem } from '@/components/admin/EditableList';
import { EditableListSkeleton } from '@/components/admin/EditableList/skeleton';
import { ListControlPanel } from '@/components/admin/ListControlPanel';
import { deleteMatches, getMatches } from '@/services';
import { TGetMatch } from '@/services/matches';
import { ModalMatchContent } from '@/components/admin/ModalMatchContent';

const columns = [
  { name: 'Противник', width: 0 },
  { name: 'Вид матча', width: 100, minWidth: 150 },
  { name: 'Дата', width: 100, minWidth: 200 },
  { name: 'Счёт', width: 500, minWidth: 100 },
] as const;

export default function AdminMatchesPage() {
  const [selectedItems, setSelectedItems] = useState<TGetMatch[]>([]);

  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['matches', page],
    queryFn: () => getMatches({ qty: 50, page }),
  });

  const matchesList = useMemo(
    () =>
      data?.matches.map((match) => ({
        data: match,
        tableData: [
          <Image
            key={match.id}
            src={match.club.logoSrc}
            alt=""
            width={64}
            height={64}
            style={{ objectFit: 'cover' }}
          />,
          match.type,
          new Date(match.date).toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          match.score.length ? `${match.score[0]} - ${match.score[1]}` : '-',
        ],
      })),
    [data]
  );

  const onDel = () =>
    modals.openConfirmModal({
      title: 'Вы уверены, что хотите удалить?',
      centered: true,
      children: (
        <Text>{selectedItems.map((match) => match.date).join(', ')}</Text>
      ),
      labels: { confirm: 'Да, удалить', cancel: 'Отменить' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteMatches(selectedItems.map((match) => match.id)).then(() =>
          refetch()
        );
        setSelectedItems([]);
      },
    });

  const onAdd = () =>
    modals.open({
      title: 'Новый матч',
      size: 'xl',
      children: <ModalMatchContent refetch={refetch} />,
    });

  const onEdit = () => {
    modals.open({
      title: `Редактирование матча`,
      size: 'xl',
      children: <ModalMatchContent data={selectedItems[0]} refetch={refetch} />,
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
      {!isLoading && matchesList && (
        <EditableList
          selectedItems={selectedItems}
          setSelectedItems={
            setSelectedItems as Dispatch<SetStateAction<TEditableItem[]>>
          }
          columns={columns}
          data={matchesList}
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
