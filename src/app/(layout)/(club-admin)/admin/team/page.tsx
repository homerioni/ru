'use client';

import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import Image from 'next/image';
import { Center, Pagination, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { Player, PLAYER_TYPE } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { EditableList, TEditableItem } from '@/components/admin/EditableList';
import { EditableListSkeleton } from '@/components/admin/EditableList/skeleton';
import { ListControlPanel } from '@/components/admin/ListControlPanel';
import { useDebounce } from '@/hooks/useDebounce';
import { createTransfer, getPlayers } from '@/services';
import defaultPlayerImg from '@/assets/img/player-default.webp';
import { useSession } from 'next-auth/react';
import { ModalClubPlayerContent } from '@/components/admin/modals/ModalClubPlayerContent';
import { playerSortEntities } from '@/utils/playerSortEntities';

const columns = [
  { name: 'Фото', width: '0%' },
  { name: 'Номер', width: '0%' },
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
  const { data: userData } = useSession();
  const clubAdminId = userData?.user?.clubAdminId;

  const [selectedItems, setSelectedItems] = useState<Player[]>([]);

  const [search, setSearch] = useState('');
  const searchDebounce = useDebounce(search, 350);

  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['players', page, searchDebounce, clubAdminId],
    queryFn: () =>
      getPlayers({
        clubId: `${clubAdminId!}`,
        qty: 50,
        search: searchDebounce || undefined,
        page,
      }),
    enabled: clubAdminId != null,
  });

  const playersList = useMemo(
    () =>
      data?.players &&
      playerSortEntities(data.players).map((player) => ({
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
          playerTypeName[player.type],
          player.name,
          player.position,
        ],
      })),
    [data]
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
        if (clubAdminId == null) return;
        selectedItems.forEach((player) => {
          createTransfer(
            {
              date: new Date(),
              playerId: player.id,
              fromClubId: clubAdminId,
              toClubId: null,
              clubAdminId: null,
            },
            true
          ).then(() => refetch());
        });
        setSelectedItems([]);
      },
    });

  const onAdd = () =>
    modals.open({
      title: 'Новый игрок',
      size: 'xl',
      children: <ModalClubPlayerContent refetch={refetch} />,
    });

  const onEdit = () => {
    modals.open({
      title: `Редактирование "${selectedItems[0]?.name}"`,
      size: 'xl',
      children: (
        <ModalClubPlayerContent data={selectedItems[0]} refetch={refetch} />
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
      />
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
