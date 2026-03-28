'use client';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Image from 'next/image';
import { Stack } from '@mantine/core';
import { modals } from '@mantine/modals';
import { Club } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { EditableList, TEditableItem } from '@/components/admin/EditableList';
import { EditableListSkeleton } from '@/components/admin/EditableList/skeleton';
import { ListControlPanel } from '@/components/admin/ListControlPanel';
import { getClub } from '@/services';
import { ModalClub } from 'src/components/admin/modals/ModalClub';
import { useSession } from 'next-auth/react';

const columns = [
  { name: 'Логотип', width: '0%' },
  { name: 'Название', width: 0 },
] as const;

export default function ClubAdminClubsPage() {
  const [selectedItems, setSelectedItems] = useState<Club[]>([]);

  const { data: userData } = useSession();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => getClub(userData!.user.clubAdminId!),
  });

  useEffect(() => {
    if (data) {
      setSelectedItems([data]);
    }
  }, [data]);

  const club = data && {
    data: data,
    tableData: [
      <Image
        key={data.id}
        src={data.logoSrc}
        alt=""
        width={64}
        height={64}
        style={{ objectFit: 'cover' }}
      />,
      data.name,
    ],
  };

  const onEdit = () => {
    modals.open({
      title: `Редактирование "${selectedItems[0]?.name}"`,
      size: 'xl',
      children: <ModalClub data={selectedItems[0]} refetch={refetch} />,
    });
  };

  if (!club) {
    return null;
  }

  return (
    <Stack gap={10}>
      <ListControlPanel selectedLength={selectedItems.length} onEdit={onEdit} />
      {isLoading && <EditableListSkeleton />}
      {!isLoading && (
        <EditableList
          selectedItems={selectedItems}
          setSelectedItems={
            setSelectedItems as Dispatch<SetStateAction<TEditableItem[]>>
          }
          columns={columns}
          data={[club]}
          stickyHeaderOffset={{ mobile: 100 }}
        />
      )}
    </Stack>
  );
}
