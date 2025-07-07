import React from 'react';
import { Path, SubmitHandler, useForm } from 'react-hook-form';
import { Button, Checkbox, Flex, Grid, Input, Select } from '@mantine/core';
import { modals } from '@mantine/modals';
import { Match } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { createMatch, getClubs, getPlayers, updateMatch } from '@/services';
import s from './styles.module.scss';
import { TGetMatch } from '@/services/matches';

type TModalPlayerContentProps = {
  data?: TGetMatch;
  refetch: () => void;
};

type PlayerFormData = {
  playerId: number;
  goals: number;
  assists: number;
};

type TForm = Omit<Match, 'createdAt' | 'updateAt' | 'id' | 'score' | 'date'> & {
  date: string;
  goals: number;
  missed: number;
  time: string;
  team: { [key: string]: PlayerFormData };
};

export const ModalMatchContent = ({
  data,
  refetch,
}: TModalPlayerContentProps) => {
  const { register, handleSubmit, setValue } = useForm<TForm>({
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

  const registerPlayerField = (playerId: number, field: keyof PlayerFormData) =>
    register(`team.p${playerId}.${field}` as Path<TForm>);

  const { data: clubsData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getClubs(),
  });

  const { data: playersData } = useQuery({
    queryKey: ['players'],
    queryFn: () => getPlayers(),
  });

  const onSubmit: SubmitHandler<TForm> = async (submitData) => {
    const match = {
      clubId: submitData.clubId,
      type: submitData.type,
      date: new Date(`${submitData.date}T${submitData.time}+03:00`),
      score:
        submitData.goals >= 0 && submitData.missed >= 0
          ? [submitData.goals, submitData.missed]
          : [],
    };

    const players: PlayerFormData[] = Object.values(submitData.team)
      .filter((item) => item.playerId)
      .map(
        (item) =>
          item && {
            playerId: +item.playerId,
            goals: item.goals ? +item.goals : 0,
            assists: item.assists ? +item.assists : 0,
          }
      );

    console.log({ ...match, players: { create: players } });

    if (data) {
      updateMatch({
        ...data,
        ...match,
        players: { deleteMany: {}, create: players },
      }).then(() => refetch());
    } else {
      createMatch({ ...match, players: { create: players } }).then(() =>
        refetch()
      );
    }

    modals.closeAll();
  };

  if (!clubsData || !playersData) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid gutter={10}>
        <Grid.Col span={{ base: 12, sm: 12 }}>
          <Grid gutter={10}>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              {clubsData && (
                <Select
                  data={clubsData.clubs.map((item) => ({
                    value: String(item.id),
                    label: item.name,
                  }))}
                  label="Соперник"
                  withAsterisk
                  placeholder="Соперник"
                  maxDropdownHeight={200}
                  searchable
                  allowDeselect={false}
                  {...register('clubId', { required: true })}
                  onChange={(_, option) => setValue('clubId', +option.value)}
                  defaultValue={data ? String(data?.clubId) : undefined}
                />
              )}
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Input.Wrapper label="Тип матча" withAsterisk>
                <Input
                  placeholder="Тип матча"
                  {...register('type', { required: true })}
                />
              </Input.Wrapper>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 2 }}>
              <Input.Wrapper label="Забили">
                <Input
                  placeholder="Забили"
                  type="number"
                  step={1}
                  {...register('goals', { valueAsNumber: true })}
                />
              </Input.Wrapper>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 2 }}>
              <Input.Wrapper label="Пропустили">
                <Input
                  placeholder="Пропустили"
                  type="number"
                  step={1}
                  {...register('missed', { valueAsNumber: true })}
                />
              </Input.Wrapper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Input.Wrapper label="Дата" withAsterisk>
                <Input
                  placeholder="Дата"
                  type="date"
                  {...register('date', { required: true })}
                />
              </Input.Wrapper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Input.Wrapper label="Время" withAsterisk>
                <Input
                  placeholder="Время"
                  type="time"
                  {...register('time', { required: true })}
                />
              </Input.Wrapper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 12 }}>
              {playersData && (
                <Grid gutter={10}>
                  {playersData.players.map((player, i) => (
                    <Grid.Col span={{ base: 12, sm: 12 }} key={player.id}>
                      <Grid gutter={10} className={s.team}>
                        <Grid.Col span={{ base: 4, sm: 4 }}>
                          <Input.Wrapper
                            label={i === 0 ? 'Состав на игру' : undefined}
                            className={s.teamLabel}
                          >
                            <div className={s.teamItem}>
                              <Checkbox
                                tabIndex={-1}
                                size="md"
                                mr="xl"
                                value={player.id}
                                {...registerPlayerField(player.id, 'playerId')}
                              />
                              <p>{player.name}</p>
                            </div>
                          </Input.Wrapper>
                        </Grid.Col>
                        <Grid.Col span={{ base: 2, sm: 2 }}>
                          <Input.Wrapper label={i === 0 ? 'Голов' : undefined}>
                            <Input
                              placeholder="Голов"
                              type="number"
                              step={1}
                              {...registerPlayerField(player.id, 'goals')}
                            />
                          </Input.Wrapper>
                        </Grid.Col>
                        <Grid.Col span={{ base: 2, sm: 2 }}>
                          <Input.Wrapper
                            label={i === 0 ? 'Ассистов' : undefined}
                          >
                            <Input
                              placeholder="Ассистов"
                              type="number"
                              step={1}
                              {...registerPlayerField(player.id, 'assists')}
                            />
                          </Input.Wrapper>
                        </Grid.Col>
                      </Grid>
                    </Grid.Col>
                  ))}
                </Grid>
              )}
            </Grid.Col>
          </Grid>
        </Grid.Col>
        <Grid.Col span={12} style={{ marginTop: '1rem' }}>
          <Flex gap={5}>
            <Button
              type="submit"
              variant="outline"
              color={data ? undefined : 'green'}
            >
              {data ? 'Сохранить' : 'Создать'}
            </Button>
            <Button
              type="button"
              variant="transparent"
              color="gray"
              onClick={() => modals.closeAll()}
            >
              Отменить
            </Button>
          </Flex>
        </Grid.Col>
      </Grid>
    </form>
  );
};
