import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Flex, Grid, Input, Select } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useQuery } from '@tanstack/react-query';
import {
  createTransfer,
  updateTransfer,
  getClubs,
  getPlayers,
} from '@/services';
import { AdminEditModal } from '@/components/admin/modals/AdminEditModal';
import { TGetTransfer } from '@/services/transfers';
import { useSession } from 'next-auth/react';
import { notifications } from '@mantine/notifications';

type TModalTransferProps = {
  data?: TGetTransfer;
  refetch: () => void;
};

type TForm = {
  playerId: string;
  fromClubId: string | null;
  toClubId: string | null;
  date: string;
};

export const ModalClubTransfer = ({ data, refetch }: TModalTransferProps) => {
  const { data: userData } = useSession();

  const { register, handleSubmit, setValue, watch } = useForm<TForm>({
    defaultValues: data
      ? {
          playerId: String(data.playerId),
          fromClubId: data.fromClubId ? String(data.fromClubId) : null,
          toClubId: data.toClubId ? String(data.toClubId) : null,
          date: new Date(data.date).toISOString().split('T')[0],
        }
      : {},
  });

  const { data: clubsData } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => getClubs(),
  });

  const { data: playersData } = useQuery({
    queryKey: ['players'],
    queryFn: () => getPlayers(),
  });

  const openAlert = (reqData: {
    playerId: number;
    fromClubId: number | null;
    toClubId: number | null;
    date: Date;
  }) => {
    const handleRequest = (isPlayerUpdate: boolean) => {
      if (data) {
        updateTransfer(
          {
            id: data.id,
            ...reqData,
            clubAdminId: userData!.user.clubAdminId!,
          },
          isPlayerUpdate
        ).then(() => {
          refetch();
        });
      } else {
        createTransfer(
          {
            ...reqData,
            clubAdminId: userData!.user.clubAdminId!,
          },
          isPlayerUpdate
        ).then(() => {
          refetch();
        });
      }

      modals.closeAll();
    };

    modals.open({
      title: (
        <p>
          Переместить игрока &#34;
          <b>
            {playersOptions.find((player) => player.value === watch('playerId'))
              ?.label ?? ''}
          </b>
          &#34; в{' '}
          {watch('toClubId') ? (
            <>
              клуб &#34;
              <b>
                {clubsOptions.find((club) => club.value === watch('toClubId'))
                  ?.label ?? ''}
              </b>
              &#34;?
            </>
          ) : (
            'в "Бывшие игроки"?'
          )}
        </p>
      ),
      size: 'xl',
      children: (
        <Flex gap={5}>
          <Button
            type="submit"
            variant="outline"
            color="green"
            onClick={() => handleRequest(true)}
          >
            Переместить
          </Button>
          <Button
            type="button"
            variant="transparent"
            color="gray"
            onClick={() => handleRequest(false)}
          >
            Отменить
          </Button>
        </Flex>
      ),
      onClose: () => modals.closeAll(),
      withCloseButton: false,
      fullScreen: false,
      centered: true,
    });
  };

  const onSubmit: SubmitHandler<TForm> = async (submitData) => {
    if (
      +(submitData.fromClubId ?? '0') !== userData!.user.clubAdminId! &&
      +(submitData.toClubId ?? '0') !== userData!.user.clubAdminId!
    ) {
      notifications.show({
        title: 'Ошибка',
        message: 'Трансфер должен быть из вашего клуба или в ваш клуб',
        color: 'red',
      });

      return;
    }

    const transfer = {
      playerId: +submitData.playerId,
      fromClubId: submitData.fromClubId ? +submitData.fromClubId : null,
      toClubId: submitData.toClubId ? +submitData.toClubId : null,
      date: new Date(`${submitData.date}T12:00:00+03:00`),
    };

    openAlert(transfer);
  };

  if (!clubsData || !playersData) {
    return null;
  }

  const clubsOptions = clubsData.clubs.map((item) => ({
    value: String(item.id),
    label: item.name,
  }));

  const playersOptions = playersData.players.map((item) => ({
    value: String(item.id),
    label: item.name,
  }));

  return (
    <AdminEditModal isCreate={!data} onSubmit={handleSubmit(onSubmit)}>
      <Grid.Col span={{ base: 12, sm: 12 }}>
        <Grid gutter={10}>
          <Grid.Col span={{ base: 12, sm: 12 }}>
            <Select
              data={playersOptions}
              label="Игрок"
              withAsterisk
              placeholder="Выберите игрока"
              maxDropdownHeight={200}
              searchable
              allowDeselect={false}
              {...register('playerId', { required: true })}
              onChange={(_, option) => setValue('playerId', option.value)}
              defaultValue={data ? String(data.playerId) : undefined}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              data={clubsOptions}
              label="Из клуба"
              placeholder="Свободный агент"
              maxDropdownHeight={200}
              searchable
              clearable
              onChange={(_, option) =>
                setValue('fromClubId', option ? option.value : null)
              }
              defaultValue={
                data && data.fromClubId ? String(data.fromClubId) : undefined
              }
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              data={clubsOptions}
              label="В клуб"
              placeholder="Свободный агент"
              maxDropdownHeight={200}
              searchable
              clearable
              onChange={(_, option) =>
                setValue('toClubId', option ? option.value : null)
              }
              defaultValue={
                data && data.toClubId ? String(data.toClubId) : undefined
              }
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 12 }}>
            <Input.Wrapper label="Дата" withAsterisk>
              <Input
                placeholder="Дата"
                type="date"
                {...register('date', { required: true })}
              />
            </Input.Wrapper>
          </Grid.Col>
        </Grid>
      </Grid.Col>
    </AdminEditModal>
  );
};
