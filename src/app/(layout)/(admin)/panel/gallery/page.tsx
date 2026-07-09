'use client';

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Badge,
  Center,
  Flex,
  Group,
  Pagination,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { ClubPhoto } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { EditableList, TEditableItem } from '@/components/admin/EditableList';
import { EditableListSkeleton } from '@/components/admin/EditableList/skeleton';
import { ListControlPanel } from '@/components/admin/ListControlPanel';
import { useDebounce } from '@/hooks/useDebounce';
import { deleteClubPhotos, getClubPhotosAll, getClubs } from '@/services';
import { ModalClubPhoto } from '@/components/admin/modals/ModalClubPhoto';

const PAGE_SIZE = 30;

const columns = [
  { name: 'Порядок', width: '8%' },
  { name: 'Фото', width: '12%' },
  { name: 'Подпись', width: 0 },
  { name: 'Статус', width: '12%' },
] as const;

export default function AdminGalleryPage() {
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<ClubPhoto[]>([]);
  const [search, setSearch] = useState('');
  const searchDebounce = useDebounce(search, 350);
  const [page, setPage] = useState(1);

  const { data: clubsData, isLoading: clubsLoading } = useQuery({
    queryKey: ['clubs-gallery-select'],
    queryFn: () => getClubs({ qty: 200 }),
  });

  const clubOptions = useMemo(
    () =>
      clubsData?.clubs.map((club) => ({
        value: String(club.id),
        label: club.name,
      })) ?? [],
    [clubsData]
  );

  useEffect(() => {
    if (!selectedClubId && clubOptions.length) {
      setSelectedClubId(clubOptions[0].value);
    }
  }, [clubOptions, selectedClubId]);

  const clubId = selectedClubId ? Number(selectedClubId) : null;

  const {
    data: allRows,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['club-photos-panel', clubId],
    queryFn: () => getClubPhotosAll(clubId!),
    enabled: clubId != null,
  });

  const filtered = useMemo(() => {
    if (!allRows) return [];

    const q = searchDebounce.trim().toLowerCase();
    if (!q) return allRows;

    return allRows.filter((row) =>
      (row.caption ?? '').toLowerCase().includes(q)
    );
  }, [allRows, searchDebounce]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const baseSortOrder = useMemo(() => {
    if (!allRows?.length) return 0;
    return Math.max(...allRows.map((row) => row.sortOrder)) + 1;
  }, [allRows]);

  const list = useMemo(
    () =>
      pageRows.map((row) => ({
        data: row,
        tableData: [
          row.sortOrder,
          <Image
            key={row.id}
            src={row.imageSrc}
            alt=""
            width={64}
            height={64}
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />,
          row.caption || '—',
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
      title: 'Удалить выбранные фото?',
      centered: true,
      children: (
        <Group gap="xs">
          {selectedItems.map((item) => (
            <Image
              key={item.id}
              src={item.imageSrc}
              alt=""
              width={48}
              height={48}
              style={{ objectFit: 'cover', borderRadius: 4 }}
            />
          ))}
        </Group>
      ),
      labels: { confirm: 'Удалить', cancel: 'Отменить' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await deleteClubPhotos(selectedItems.map((item) => item.id));
        setSelectedItems([]);
        refetch();
      },
    });

  const onAdd = () => {
    if (clubId == null) return;

    modals.open({
      title: 'Новые фото',
      size: 'xl',
      children: (
        <ModalClubPhoto
          clubId={clubId}
          refetch={refetch}
          baseSortOrder={baseSortOrder}
        />
      ),
    });
  };

  const onEdit = () => {
    if (clubId == null) return;

    modals.open({
      title: 'Редактирование фото',
      size: 'xl',
      children: (
        <ModalClubPhoto
          clubId={clubId}
          data={selectedItems[0]}
          refetch={refetch}
        />
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
      >
        <Flex align="flex-end" gap={4} miw={{ base: '100%', sm: 280 }}>
          <Select
            w={{ base: '100%', sm: 280 }}
            data={clubOptions}
            placeholder={clubsLoading ? 'Загрузка клубов...' : 'Клуб'}
            maxDropdownHeight={240}
            allowDeselect={false}
            searchable
            value={selectedClubId}
            onChange={setSelectedClubId}
            disabled={clubsLoading || clubOptions.length === 0}
          />
        </Flex>
      </ListControlPanel>
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
          <Pagination total={totalPages} value={page} onChange={setPage} />
        </Center>
      )}
      {!isLoading && clubId != null && filtered.length === 0 && (
        <Text c="dimmed" ta="center">
          Галерея выбранного клуба пока пуста.
        </Text>
      )}
    </Stack>
  );
}
