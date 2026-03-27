import { SubmitHandler, useForm } from 'react-hook-form';
import { Grid, Input, Select } from '@mantine/core';
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

export const ModalTransfer = ({ data, refetch }: TModalTransferProps) => {
  const { register, handleSubmit, setValue } = useForm<TForm>({
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

  const onSubmit: SubmitHandler<TForm> = async (submitData) => {
    const transfer = {
      playerId: +submitData.playerId,
      fromClubId: submitData.fromClubId ? +submitData.fromClubId : null,
      toClubId: submitData.toClubId ? +submitData.toClubId : null,
      date: new Date(`${submitData.date}T12:00:00+03:00`),
    };

    if (data) {
      updateTransfer({
        id: data.id,
        ...transfer,
      }).then(() => refetch());
    } else {
      createTransfer(transfer).then(() => refetch());
    }

    modals.closeAll();
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
