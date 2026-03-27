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
import { Player, PLAYER_TYPE } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { EditableList, TEditableItem } from '@/components/admin/EditableList';
import { EditableListSkeleton } from '@/components/admin/EditableList/skeleton';
import { ListControlPanel } from '@/components/admin/ListControlPanel';
import { ModalPlayerContent } from 'src/components/admin/modals/ModalPlayerContent';
import { useDebounce } from '@/hooks/useDebounce';
import { deletePlayers, getClubs, getPlayers } from '@/services';
import defaultPlayerImg from '@/assets/img/player-default.webp';

const columns = [
  { name: 'Фото', width: '0%' },
  { name: 'Номер', width: '0%' },
  { name: 'Клуб', width: '0%' },
  { name: 'Тип', width: '0%' },
  { name: 'Имя', width: 0 },
  { name: 'Позиция', width: 0 },
] as const;

const playerTypeName: { [key in PLAYER_TYPE]: string } = {
  player: 'Игрок',
  old_player: 'Бывший игрок',
  team: 'Представитель',
};

export default function AdminTeamPage() {
  const [selectedItems, setSelectedItems] = useState<Player[]>([]);

  const [clubId, setClubId] = useState<string | null>();
  const [search, setSearch] = useState('');
  const searchDebounce = useDebounce(search, 350);

  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['players', page, searchDebounce],
    queryFn: () =>
      getPlayers({ qty: 50, search: searchDebounce || undefined, page }),
  });

  const { data: clubsData } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => getClubs(),
  });

  const playersList = useMemo(
    () =>
      data?.players
        .filter((player) => !clubId || player.clubId === +clubId)
        .sort((a, b) => (a.number ?? 9999) - (b.number ?? 9999))
        .map((player) => ({
          data: player,
          tableData: [
            <Image
              key={player.id}
              src={player.photo ?? defaultPlayerImg}
              alt=""
              width={64}
              height={64}
              style={{ objectFit: 'cover' }}
            />,
            player.number,
            <Image
              key={player.clubId}
              src={player.club.logoSrc}
              alt=""
              width={40}
              height={40}
              style={{ objectFit: 'cover' }}
            />,
            playerTypeName[player.type],
            player.name,
            player.position,
          ],
        })),
    [data, clubId]
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
      >
        {clubsData && (
          <Flex align="center" gap={4}>
            <Select
              data={clubsData.clubs.map((item) => ({
                value: String(item.id),
                label: item.name,
              }))}
              placeholder="Команда"
              maxDropdownHeight={200}
              allowDeselect={false}
              onChange={setClubId}
              value={clubId}
            />
            {clubId && <CloseButton onClick={() => setClubId(null)} />}
          </Flex>
        )}
      </ListControlPanel>
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
