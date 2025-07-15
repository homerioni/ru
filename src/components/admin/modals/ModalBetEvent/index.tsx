import { SubmitHandler, useForm } from 'react-hook-form';
import { Grid, Input, Select } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useQuery } from '@tanstack/react-query';
import { AdminEditModal } from '@/components/admin/modals/AdminEditModal';
import { TForm, TModalBetEventProps } from './types';
import { getMatchDate } from '@/utils/getMatchDate';
import { getNextMatches } from '@/services/matches';
import { createBetEvent, getBetTypes, updateBetEvent } from '@/services/bets';
import { TCreateBetEvent, TUpdateBetEvent } from '@/types';

export const ModalBetEvent = ({ data, refetch }: TModalBetEventProps) => {
  const { register, handleSubmit, setValue } = useForm<TForm>({
    defaultValues: data
      ? {
          id: data.id,
          matchId: data.match.id,
          events: data.events.map((item) => JSON.stringify(item.ratio)),
        }
      : {},
  });

  const { data: matchesData } = useQuery({
    queryKey: ['matches'],
    queryFn: () => getNextMatches(),
  });

  const { data: betTypes } = useQuery({
    queryKey: ['betTypes'],
    queryFn: () => getBetTypes(),
  });

  const onSubmit: SubmitHandler<TForm> = async (submitData) => {
    if (data) {
      const betEvent: TUpdateBetEvent = {
        id: submitData.id,
        matchId: submitData.matchId,
        isCompleted: false,
        events: {
          updateMany: data.events.map((event, i) => ({
            where: { id: event.id },
            data: {
              name: event.name,
              code: event.code,
              ratio: (JSON.parse(submitData.events[i]) as number[]).map((x) =>
                Math.floor(x * 100)
              ),
            },
          })),
        },
      };

      updateBetEvent(betEvent).then(() => refetch());
    } else {
      const betEvent: TCreateBetEvent = {
        matchId: submitData.matchId,
        isCompleted: false,
        events: {
          create: betTypes?.map((type, i) => ({
            name: type.name,
            code: type.code,
            ratio: (JSON.parse(submitData.events[i]) as number[]).map((x) =>
              Math.floor(x * 100)
            ),
          })),
        },
      };

      createBetEvent(betEvent).then(() => refetch());
    }

    modals.closeAll();
  };

  return (
    <AdminEditModal isCreate={!data} onSubmit={handleSubmit(onSubmit)}>
      <Grid.Col span={{ base: 12, sm: 12 }}>
        <Grid gutter={10}>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            {matchesData && (
              <Select
                data={matchesData.map((item) => ({
                  value: String(item.id),
                  label: `${getMatchDate(item.date).day} - ${item.homeClub.name} vs ${item.awayClub.name}`,
                }))}
                label="Матч"
                withAsterisk
                placeholder="Матч"
                maxDropdownHeight={200}
                allowDeselect={false}
                {...register('matchId', { required: true })}
                onChange={(_, option) => setValue('matchId', +option.value)}
                defaultValue={data ? String(data?.matchId) : undefined}
              />
            )}
          </Grid.Col>
          {betTypes &&
            betTypes.map((type, i) => (
              <Grid.Col key={type.id} span={{ base: 12, sm: 4 }}>
                <Input.Wrapper label={type.name} withAsterisk>
                  <Input
                    placeholder={type.code}
                    {...register(`events.${i}`, {
                      required: true,
                    })}
                  />
                </Input.Wrapper>
              </Grid.Col>
            ))}
        </Grid>
      </Grid.Col>
    </AdminEditModal>
  );
};
