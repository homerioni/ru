'use client';

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Badge, Center, Group, Pagination, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { SiteUpdate } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { EditableList, TEditableItem } from '@/components/admin/EditableList';
import { EditableListSkeleton } from '@/components/admin/EditableList/skeleton';
import { ListControlPanel } from '@/components/admin/ListControlPanel';
import { useDebounce } from '@/hooks/useDebounce';
import { deleteSiteUpdates, getSiteUpdatesAll } from '@/services';
import { ModalSiteUpdate } from '@/components/admin/modals/ModalSiteUpdate';

const PAGE_SIZE = 30;

const columns = [
  { name: 'Порядок', width: '8%' },
  { name: 'Заголовок', width: 0 },
  { name: 'Картинки', width: '14%' },
  { name: 'Статус', width: '12%' },
] as const;

export default function AdminSiteUpdatesPage() {
  const [selectedItems, setSelectedItems] = useState<SiteUpdate[]>([]);
  const [search, setSearch] = useState('');
  const searchDebounce = useDebounce(search, 350);
  const [page, setPage] = useState(1);

  const { data: allRows, isLoading, refetch } = useQuery({
    queryKey: ['site-updates-admin', searchDebounce],
    queryFn: () => getSiteUpdatesAll(),
  });

  const filtered = useMemo(() => {
    if (!allRows) return [];
    const q = searchDebounce.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter(
      (row) =>
        row.title.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q)
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
          row.sortOrder,
          row.title,
          row.imageSrcs?.length ? (
            <Group gap={4} wrap="nowrap">
              {row.imageSrcs.slice(0, 3).map((src) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  width={44}
                  height={44}
                  style={{ objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                />
              ))}
              {row.imageSrcs.length > 3 ? (
                <Text component="span" fz="xs" c="dimmed">
                  +{row.imageSrcs.length - 3}
                </Text>
              ) : null}
            </Group>
          ) : (
            '—'
          ),
          row.isPublished ? (
            <Badge color="green">Опубликовано</Badge>
          ) : (
            <Badge color="gray">Скрыто</Badge>
          ),
        ],
      })),
    [pageRows]
  );

  const onDel = () =>
    modals.openConfirmModal({
      title: 'Удалить выбранные объявления?',
      centered: true,
      children: (
        <Text>{selectedItems.map((item) => item.title).join(', ')}</Text>
      ),
      labels: { confirm: 'Удалить', cancel: 'Отменить' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await deleteSiteUpdates(selectedItems.map((item) => item.id));
        setSelectedItems([]);
        refetch();
      },
    });

  const onAdd = () =>
    modals.open({
      title: 'Новое объявление',
      size: 'xl',
      children: <ModalSiteUpdate refetch={refetch} />,
    });

  const onEdit = () => {
    modals.open({
      title: `Редактирование «${selectedItems[0]?.title}»`,
      size: 'xl',
      children: <ModalSiteUpdate data={selectedItems[0]} refetch={refetch} />,
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
