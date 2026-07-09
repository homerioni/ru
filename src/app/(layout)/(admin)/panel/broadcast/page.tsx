'use client';

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Badge, Center, Pagination, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { LiveBroadcast } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { EditableList, TEditableItem } from '@/components/admin/EditableList';
import { EditableListSkeleton } from '@/components/admin/EditableList/skeleton';
import { ListControlPanel } from '@/components/admin/ListControlPanel';
import { useDebounce } from '@/hooks/useDebounce';
import { deleteBroadcasts, getBroadcastsAll } from '@/services';
import { ModalBroadcast } from '@/components/admin/modals/ModalBroadcast';

const PAGE_SIZE = 20;

const columns = [
  { name: 'Заголовок', width: 0 },
  { name: 'Комната', width: '18%' },
  { name: 'Статус', width: '12%' },
] as const;

export default function AdminBroadcastPage() {
  const [selectedItems, setSelectedItems] = useState<LiveBroadcast[]>([]);
  const [search, setSearch] = useState('');
  const searchDebounce = useDebounce(search, 350);
  const [page, setPage] = useState(1);

  const { data: allRows, isLoading, refetch } = useQuery({
    queryKey: ['broadcast-admin', searchDebounce],
    queryFn: () => getBroadcastsAll(),
  });

  const filtered = useMemo(() => {
    if (!allRows) return [];
    const q = searchDebounce.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter(
      (row) =>
        row.title.toLowerCase().includes(q) ||
        row.jitsiRoomName.toLowerCase().includes(q) ||
        row.streamInput.toLowerCase().includes(q)
    );
  }, [allRows, searchDebounce]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const list = useMemo(
    () =>
      pageRows.map((row) => ({
        data: row,
        tableData: [
          row.title,
          row.jitsiRoomName,
          row.isActive ? (
            <Badge color="red">В эфире</Badge>
          ) : (
            <Badge color="gray">Выключена</Badge>
          ),
        ],
      })),
    [pageRows]
  );

  const onDel = () =>
    modals.openConfirmModal({
      title: 'Удалить выбранные трансляции?',
      centered: true,
      children: (
        <Text>{selectedItems.map((item) => item.title).join(', ')}</Text>
      ),
      labels: { confirm: 'Удалить', cancel: 'Отменить' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await deleteBroadcasts(selectedItems.map((item) => item.id));
        setSelectedItems([]);
        refetch();
      },
    });

  const onAdd = () =>
    modals.open({
      title: 'Новая трансляция',
      size: 'lg',
      children: <ModalBroadcast refetch={refetch} />,
    });

  const onEdit = () => {
    modals.open({
      title: `Редактирование «${selectedItems[0]?.title}»`,
      size: 'lg',
      children: <ModalBroadcast data={selectedItems[0]} refetch={refetch} />,
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
      {!isLoading && list && (
        <EditableList
          selectedItems={selectedItems}
          setSelectedItems={
            setSelectedItems as Dispatch<SetStateAction<TEditableItem[]>>
          }
          columns={columns}
          data={list}
        />
      )}
      {totalPages > 1 && (
        <Center>
          <Pagination
            total={totalPages}
            value={page}
            onChange={(num) => setPage(num)}
          />
        </Center>
      )}
    </Stack>
  );
}
