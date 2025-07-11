'use client';

import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Center,
  CloseButton,
  Flex,
  Pagination,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { useQuery } from '@tanstack/react-query';
import { EditableList, TEditableItem } from '@/components/admin/EditableList';
import { EditableListSkeleton } from '@/components/admin/EditableList/skeleton';
import { ListControlPanel } from '@/components/admin/ListControlPanel';
import { deleteMatches, getClubs, getMatches } from '@/services';
import { TGetMatch } from '@/services/matches';
import { ModalMatch } from 'src/components/admin/modals/ModalMatch';
import { getMatchTypes } from '@/services/matchTypes';

const columns = [
  { name: '', width: '0%' },
  { name: 'Счёт', width: '0%', minWidth: 70 },
  { name: '', width: '0%' },
  { name: 'Вид матча', width: 200, minWidth: 200 },
  { name: 'Дата', width: 1000, minWidth: 200 },
] as const;

export default function AdminMatchesPage() {
  const [selectedItems, setSelectedItems] = useState<TGetMatch[]>([]);

  const [page, setPage] = useState(1);
  const [clubId, setClubId] = useState<string | null>();
  const [typeId, setTypeId] = useState<string | null>();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['matches', page, clubId, typeId],
    queryFn: () =>
      getMatches({
        qty: 50,
        page,
        clubId: clubId ? +clubId : undefined,
        typeId: typeId ? +typeId : undefined,
      }),
  });

  const { data: matchTypesData } = useQuery({
    queryKey: ['types'],
    queryFn: () => getMatchTypes(),
  });

  const { data: clubsData } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => getClubs(),
  });

  const matchesList = useMemo(
    () =>
      data?.matches.map((match) => ({
        data: match,
        tableData: [
          <Image
            key={match.id}
            src={match.homeClub.logoSrc}
            alt=""
            width={64}
            height={64}
            style={{ objectFit: 'cover' }}
          />,
          match.score.length ? `${match.score[0]} - ${match.score[1]}` : '-',
          <Image
            key={match.id}
            src={match.awayClub.logoSrc}
            alt=""
            width={64}
            height={64}
            style={{ objectFit: 'cover' }}
          />,
          match.type.name,
          new Date(match.date).toLocaleString('ru-RU', {
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
      children: <ModalMatch refetch={refetch} />,
    });

  const onEdit = () => {
    modals.open({
      title: `Редактирование матча`,
      size: 'xl',
      children: <ModalMatch data={selectedItems[0]} refetch={refetch} />,
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
        {matchTypesData && (
          <Flex align="center" gap={4}>
            <Select
              data={matchTypesData.map((item) => ({
                value: String(item.id),
                label: item.year ? `${item.name} ${item.year}` : item.name,
              }))}
              placeholder="Тип матча"
              maxDropdownHeight={200}
              searchable
              allowDeselect={false}
              onChange={setTypeId}
              value={typeId}
            />
            {typeId && <CloseButton onClick={() => setTypeId(null)} />}
          </Flex>
        )}
        {clubsData && (
          <Flex align="center" gap={4}>
            <Select
              data={clubsData.clubs.map((item) => ({
                value: String(item.id),
                label: item.name,
              }))}
              placeholder="Команда"
              maxDropdownHeight={200}
              searchable
              allowDeselect={false}
              onChange={setClubId}
              value={clubId}
            />
            {clubId && <CloseButton onClick={() => setClubId(null)} />}
          </Flex>
        )}
      </ListControlPanel>
      {isLoading && <EditableListSkeleton />}
      {!isLoading && matchesList && (
        <EditableList
          selectedItems={selectedItems}
          setSelectedItems={
            setSelectedItems as Dispatch<SetStateAction<TEditableItem[]>>
          }
          columns={columns}
          data={matchesList}
          stickyHeaderOffset={{ mobile: 300 }}
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
