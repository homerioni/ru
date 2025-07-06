import React from 'react';
import { Path, SubmitHandler, useForm } from 'react-hook-form';
import { Button, Checkbox, Flex, Grid, Input, Select } from '@mantine/core';
import { modals } from '@mantine/modals';
import { Match } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { createMatch, getClubs, getPlayers, updateMatch } from '@/services';
import s from './styles.module.scss';

type TModalPlayerContentProps = {
  data?: Match;
  refetch: () => void;
};

type PlayerFormData = {
  isSelected: boolean;
  goals: number;
  assists: number;
};

type TForm = Omit<Match, 'createdAt' | 'updateAt' | 'id' | 'score'> & {
  goals: number;
  missed: number;
  time: string;
  team: {
    [key: number]: PlayerFormData;
  };
};

export const ModalMatchContent = ({
  data,
  refetch,
}: TModalPlayerContentProps) => {
  const { register, handleSubmit, setValue } = useForm<TForm>({
    defaultValues: data ?? {},
  });

  const registerPlayerField = (playerId: number, field: keyof PlayerFormData) =>
    register(`team.${playerId}.${field}` as Path<TForm>);

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
      date: submitData.date,
      score:
        submitData.goals !== undefined && submitData.missed !== undefined
          ? [submitData.goals, submitData.missed]
          : [],
    };

    if (data) {
      updateMatch({
        ...data,
        ...match,
      }).then(() => refetch());
    } else {
      createMatch({ ...match }).then(() => refetch());
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
                  {...register('goals')}
                />
              </Input.Wrapper>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 2 }}>
              <Input.Wrapper label="Пропустили">
                <Input
                  placeholder="Пропустили"
                  type="number"
                  step={1}
                  {...register('missed')}
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
                                aria-hidden
                                {...registerPlayerField(
                                  player.id,
                                  'isSelected'
                                )}
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
