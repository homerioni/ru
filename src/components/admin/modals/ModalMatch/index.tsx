import { Path, SubmitHandler, useForm } from 'react-hook-form';
import { Grid, Input, Select } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useQuery } from '@tanstack/react-query';
import { createMatch, getClubs, getPlayers, updateMatch } from '@/services';
import { getMatchTypes } from '@/services/matchTypes';
import { AdminEditModal } from '@/components/admin/modals/AdminEditModal';
import { PlayerMatchItem } from '@/components/admin/modals/ModalMatch/PlayerMatchItem';
import { PlayerFormData, TForm, TModalPlayerProps } from './types';
import { PlayersSkeleton } from '@/components/admin/modals/ModalMatch/PlayersSkeleton';
import { MY_CLUB_ID } from '@/constants';

export const ModalMatch = ({ data, refetch }: TModalPlayerProps) => {
  const { register, handleSubmit, setValue, watch } = useForm<TForm>({
    defaultValues: data
      ? {
          ...data,
          date: new Date(data.date).toISOString().split('T')[0],
          time: new Date(data.date).toLocaleTimeString(),
          goals: data.score[0],
          missed: data.score[1],
          team: Object.fromEntries(
            data.players.map((item) => [`p${item.playerId}`, item])
          ),
        }
      : {},
  });

  const isMyClub =
    watch('homeClubId') === MY_CLUB_ID || watch('awayClubId') === MY_CLUB_ID;

  const registerPlayerField = (playerId: number, field: keyof PlayerFormData) =>
    register(`team.p${playerId}.${field}` as Path<TForm>);

  const { data: clubsData } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => getClubs(),
  });

  const { data: playersData, isLoading: playersIsLoading } = useQuery({
    queryKey: ['players'],
    queryFn: () => getPlayers(),
    enabled: isMyClub,
  });

  const { data: matchTypesData } = useQuery({
    queryKey: ['types'],
    queryFn: () => getMatchTypes(),
  });

  const onSubmit: SubmitHandler<TForm> = async (submitData) => {
    const match = {
      awayClubId: submitData.awayClubId,
      homeClubId: submitData.homeClubId,
      typeId: submitData.typeId,
      date: new Date(`${submitData.date}T${submitData.time}+03:00`),
      score:
        submitData.goals >= 0 && submitData.missed >= 0
          ? [submitData.goals, submitData.missed]
          : [],
      round: submitData.round,
      yellowCards: submitData.yellowCards,
      redCards: submitData.redCards,
    };

    const players: PlayerFormData[] | null = isMyClub
      ? Object.values(submitData.team)
          .filter((item) => item.playerId)
          .map(
            (item) =>
              item && {
                playerId: +item.playerId,
                goals: item.goals ? +item.goals : 0,
                assists: item.assists ? +item.assists : 0,
              }
          )
      : null;

    if (data) {
      updateMatch({
        ...data,
        ...match,
        players: players ? { deleteMany: {}, create: players } : undefined,
      }).then(() => refetch());
    } else {
      createMatch({
        ...match,
        players: players ? { create: players } : undefined,
      }).then(() => refetch());
    }

    modals.closeAll();
  };

  if (!clubsData || !matchTypesData) {
    return null;
  }

  return (
    <AdminEditModal isCreate={!data} onSubmit={handleSubmit(onSubmit)}>
      <Grid.Col span={{ base: 12, sm: 12 }}>
        <Grid gutter={10}>
          <Grid.Col span={{ base: 8, sm: 4 }}>
            {clubsData && (
              <Select
                data={clubsData.clubs.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
                label="Команда"
                withAsterisk
                placeholder="Команда"
                maxDropdownHeight={200}
                searchable
                allowDeselect={false}
                {...register('homeClubId', { required: true })}
                onChange={(_, option) => setValue('homeClubId', +option.value)}
                defaultValue={data ? String(data?.homeClubId) : undefined}
              />
            )}
          </Grid.Col>
          <Grid.Col span={{ base: 4, sm: 2 }}>
            <Input.Wrapper label="Счёт">
              <Input
                placeholder="Счёт"
                type="number"
                step={1}
                {...register('goals', { valueAsNumber: true })}
              />
            </Input.Wrapper>
          </Grid.Col>
          <Grid.Col span={{ base: 8, sm: 4 }}>
            {clubsData && (
              <Select
                data={clubsData.clubs.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
                label="Команда"
                withAsterisk
                placeholder="Команда"
                maxDropdownHeight={200}
                searchable
                allowDeselect={false}
                {...register('awayClubId', { required: true })}
                onChange={(_, option) => setValue('awayClubId', +option.value)}
                defaultValue={data ? String(data?.awayClubId) : undefined}
              />
            )}
          </Grid.Col>
          <Grid.Col span={{ base: 4, sm: 2 }}>
            <Input.Wrapper label="Счёт">
              <Input
                placeholder="Счёт"
                type="number"
                step={1}
                {...register('missed', { valueAsNumber: true })}
              />
            </Input.Wrapper>
          </Grid.Col>
          <Grid.Col span={{ base: 8, sm: 4 }}>
            {matchTypesData && (
              <Select
                data={matchTypesData.map((item) => ({
                  value: String(item.id),
                  label: item.year ? `${item.name} ${item.year}` : item.name,
                }))}
                label="Тип матча"
                withAsterisk
                placeholder="Тип матча"
                maxDropdownHeight={200}
                searchable
                allowDeselect={false}
                {...register('typeId', { required: true })}
                onChange={(_, option) => setValue('typeId', +option.value)}
                defaultValue={data ? String(data?.typeId) : undefined}
              />
            )}
          </Grid.Col>
          <Grid.Col span={{ base: 4, sm: 2 }}>
            <Input.Wrapper label="Номер тура">
              <Input
                placeholder="Тур"
                type="number"
                step={1}
                {...register('round', { valueAsNumber: true })}
              />
            </Input.Wrapper>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Input.Wrapper label="Дата" withAsterisk>
              <Input
                placeholder="Дата"
                type="date"
                {...register('date', { required: true })}
              />
            </Input.Wrapper>
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Input.Wrapper label="Время" withAsterisk>
              <Input
                placeholder="Время"
                type="time"
                {...register('time', { required: true })}
              />
            </Input.Wrapper>
          </Grid.Col>
          <Grid.Col span={{ base: 4, sm: 2 }}>
            <Input.Wrapper label="Желтых карт">
              <Input
                placeholder="Желтых"
                type="number"
                step={1}
                {...register('yellowCards', { valueAsNumber: true })}
              />
            </Input.Wrapper>
          </Grid.Col>
          <Grid.Col span={{ base: 4, sm: 2 }}>
            <Input.Wrapper label="Красных карт">
              <Input
                placeholder="Красных"
                type="number"
                step={1}
                {...register('redCards', { valueAsNumber: true })}
              />
            </Input.Wrapper>
          </Grid.Col>
          {playersIsLoading && <PlayersSkeleton />}
          {isMyClub && playersData && (
            <Grid.Col span={{ base: 12, sm: 12 }}>
              <PlayerMatchItem
                players={playersData.players}
                registerPlayerField={registerPlayerField}
              />
            </Grid.Col>
          )}
        </Grid>
      </Grid.Col>
    </AdminEditModal>
  );
};
