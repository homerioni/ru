'use client';

import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { modals } from '@mantine/modals';
import { Stack, Text } from '@mantine/core';
import { ListControlPanel } from '@/components/admin/ListControlPanel';
import { EditableListSkeleton } from '@/components/admin/EditableList/skeleton';
import { EditableList, TEditableItem } from '@/components/admin/EditableList';
import { MatchType } from '@prisma/client';
import { deleteMatchTypes, getMatchTypes } from '@/services/matchTypes';
import { ModalMatchType } from '@/components/admin/modals/ModalMatchType';

const columns = [
  { name: 'Год', width: 60, minWidth: 60 },
  { name: 'Название', width: 100, minWidth: 180 },
  { name: 'Полное название', width: '100%', minWidth: 200 },
] as const;

export default function AdminTypesPage() {
  const [selectedItems, setSelectedItems] = useState<MatchType[]>([]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['types'],
    queryFn: () => getMatchTypes(),
  });

  const matchesList = useMemo(
    () =>
      data?.map((type) => ({
        data: type,
        tableData: [type.year, type.name, type.fullName],
      })),
    [data]
  );

  const onDel = () =>
    modals.openConfirmModal({
      title: 'Вы уверены, что хотите удалить?',
      centered: true,
      children: (
        <Text>{selectedItems.map((type) => type.name).join(', ')}</Text>
      ),
      labels: { confirm: 'Да, удалить', cancel: 'Отменить' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteMatchTypes(selectedItems.map((type) => type.id)).then(() =>
          refetch()
        );
        setSelectedItems([]);
      },
    });

  const onAdd = () =>
    modals.open({
      title: 'Новый тип матча',
      size: 'xl',
      children: <ModalMatchType refetch={refetch} />,
    });

  const onEdit = () => {
    modals.open({
      title: `Редактирование типа матча`,
      size: 'xl',
      children: <ModalMatchType data={selectedItems[0]} refetch={refetch} />,
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
    </Stack>
  );
}
