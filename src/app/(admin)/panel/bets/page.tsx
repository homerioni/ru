'use client';

import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { modals } from '@mantine/modals';
import { Button, Stack, Text } from '@mantine/core';
import { ListControlPanel } from '@/components/admin/ListControlPanel';
import { EditableListSkeleton } from '@/components/admin/EditableList/skeleton';
import { EditableList, TEditableItem } from '@/components/admin/EditableList';
import {
  completedEvent,
  deleteBetEvent,
  getBetEvents,
  TGetBetEvents,
} from '@/services/bets';
import { ModalBetEvent } from '@/components/admin/modals/ModalBetEvent';
import { IconRosetteDiscountCheck } from '@tabler/icons-react';

const columns = [
  { name: 'Клубы', width: '0%' },
  { name: '', width: '0%' },
  { name: 'Дата', width: 0 },
] as const;

export default function AdminBetsPage() {
  const [selectedItems, setSelectedItems] = useState<TGetBetEvents[]>([]);
  const [isCompletedLoading, setIsCompletedLoading] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['betEvents'],
    queryFn: () => getBetEvents(),
  });

  const eventsList = useMemo(
    () =>
      data?.events.map((event) => ({
        data: event,
        tableData: [
          <Image
            key={event.match.homeClub.id}
            src={event.match.homeClub.logoSrc}
            alt=""
            width={64}
            height={64}
            style={{ objectFit: 'cover' }}
          />,
          <Image
            key={event.match.awayClub.id}
            src={event.match.awayClub.logoSrc}
            alt=""
            width={64}
            height={64}
            style={{ objectFit: 'cover' }}
          />,
          new Date(event.match.date).toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        ],
      })),
    [data]
  );

  const onDel = () =>
    modals.openConfirmModal({
      title: 'Вы уверены, что хотите удалить?',
      centered: true,
      children: (
        <Text>{selectedItems.map((event) => event.id).join(', ')}</Text>
      ),
      labels: { confirm: 'Да, удалить', cancel: 'Отменить' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteBetEvent(selectedItems.map((event) => event.id)).then(() =>
          refetch()
        );
        setSelectedItems([]);
      },
    });

  const onAdd = () =>
    modals.open({
      title: 'Новый матч',
      size: 'xl',
      children: <ModalBetEvent refetch={refetch} />,
    });

  const onEdit = () => {
    modals.open({
      title: `Редактирование события`,
      size: 'xl',
      children: <ModalBetEvent data={selectedItems[0]} refetch={refetch} />,
    });
    setSelectedItems([]);
  };

  const onCompleted = () => {
    setIsCompletedLoading(true);
    completedEvent(selectedItems[0]?.id).finally(() => {
      setIsCompletedLoading(false);
      refetch();
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
      >
        <Button
          flex="none"
          variant="light"
          color="orange"
          onClick={onCompleted}
          disabled={selectedItems.length !== 1}
          loading={isCompletedLoading}
          leftSection={<IconRosetteDiscountCheck size={20} stroke={1.5} />}
        >
          Завершить
        </Button>
      </ListControlPanel>
      {isLoading && <EditableListSkeleton />}
      {!isLoading && eventsList && (
        <EditableList
          selectedItems={selectedItems}
          setSelectedItems={
            setSelectedItems as Dispatch<SetStateAction<TEditableItem[]>>
          }
          columns={columns}
          data={eventsList}
        />
      )}
    </Stack>
  );
}
