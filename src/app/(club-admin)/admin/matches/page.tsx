'use client';

import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Button,
  Center,
  CloseButton,
  Flex,
  Pagination,
  Select,
  Stack,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { useQuery } from '@tanstack/react-query';
import { EditableList, TEditableItem } from '@/components/admin/EditableList';
import { EditableListSkeleton } from '@/components/admin/EditableList/skeleton';
import { ListControlPanel } from '@/components/admin/ListControlPanel';
import { closeVote, getClubs, getMatches, startVote } from '@/services';
import { TGetMatch } from '@/services/matches';
import { ModalClubAdminMatch } from 'src/components/admin/modals/ModalClubAdminMatch';
import { getMatchTypes } from '@/services/matchTypes';
import { useSession } from 'next-auth/react';

const columns = [
  { name: '', width: '0%' },
  { name: 'Счёт', width: '0%', minWidth: 70 },
  { name: '', width: '0%' },
  { name: 'Вид матча', width: 200, minWidth: 200 },
  { name: 'Дата', width: 1000, minWidth: 200 },
  { name: '', width: '0%' },
] as const;

const matchesVoteStatus = (
  id: number,
  status: string,
  refetch?: () => void
) => {
  switch (status) {
    case 'init':
      return {
        text: 'Начать голосование',
        onClick: () => startVote(id).then(refetch),
      };
    case 'started':
      return {
        text: 'Закрыть голосование',
        onClick: () => closeVote(id).then(refetch),
      };
    default:
      return {
        text: 'Голосование закончено',
      };
  }
};

export default function ClubAdminMatchesPage() {
  const { data: userData } = useSession();

  const [selectedItems, setSelectedItems] = useState<TGetMatch[]>([]);

  const [page, setPage] = useState(1);
  const [typeId, setTypeId] = useState<string | null>();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['matches', page, userData!.user.clubAdminId!, typeId],
    queryFn: () =>
      getMatches({
        qty: 50,
        page,
        clubId: userData!.user.clubAdminId!,
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
          <Button
            key={match.id}
            color={match.voteStatus === 'started' ? 'red' : undefined}
            disabled={match.voteStatus === 'closed'}
            onClick={
              matchesVoteStatus(match.id, match.voteStatus, () => refetch())
                .onClick
            }
          >
            {matchesVoteStatus(match.id, match.voteStatus).text}
          </Button>,
        ],
      })),
    [data, refetch]
  );

  const onAdd = () =>
    modals.open({
      title: 'Новый матч',
      size: 'xl',
      children: <ModalClubAdminMatch refetch={refetch} />,
    });

  const onEdit = () => {
    modals.open({
      title: `Редактирование матча`,
      size: 'xl',
      children: (
        <ModalClubAdminMatch data={selectedItems[0]} refetch={refetch} />
      ),
    });
    setSelectedItems([]);
  };

  return (
    <Stack gap={10}>
      <ListControlPanel
        selectedLength={selectedItems.length}
        onAdd={onAdd}
        onEdit={onEdit}
      >
        {(matchTypesData || clubsData) && (
          <Flex gap={10}>
            {matchTypesData && (
              <Flex align="center" gap={4}>
                <Select
                  data={matchTypesData.map((item) => ({
                    value: String(item.id),
                    label: item.year ? `${item.name} ${item.year}` : item.name,
                  }))}
                  placeholder="Тип матча"
                  maxDropdownHeight={200}
                  allowDeselect={false}
                  onChange={setTypeId}
                  value={typeId}
                />
                {typeId && <CloseButton onClick={() => setTypeId(null)} />}
              </Flex>
            )}
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
          stickyHeaderOffset={{ mobile: 205 }}
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
