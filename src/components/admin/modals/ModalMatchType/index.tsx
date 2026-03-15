import { SubmitHandler, useForm } from 'react-hook-form';
import { Flex, Grid, Input, MultiSelect, Select, Switch } from '@mantine/core';
import { modals } from '@mantine/modals';
import { MatchType } from '@prisma/client';
import { AdminEditModal } from '@/components/admin/modals/AdminEditModal';
import { createMatchType, updateMatchType } from '@/services/matchTypes';
import { useQuery } from '@tanstack/react-query';
import { getClubs } from '@/services';

type TModalMatchTypeProps = {
  data?: MatchType & { clubs: string[] };
  refetch: () => void;
};

type TForm = Omit<MatchType, 'id'> & { clubs: string[] };

const TYPES: { id: TForm['type']; label: string }[] = [
  { id: 'any', label: 'Матчи' },
  { id: 'cup', label: 'Кубок' },
  { id: 'league', label: 'Турнир' },
];

export const ModalMatchType = ({ data, refetch }: TModalMatchTypeProps) => {
  const { register, handleSubmit, setValue, watch } = useForm<TForm>({
    defaultValues: data ?? {},
  });

  const { data: clubsData, isLoading: isClubsLoading } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => getClubs(),
  });

  const onSubmit: SubmitHandler<TForm> = async (matchType) => {
    if (data) {
      updateMatchType({
        ...data,
        ...matchType,
      }).then(() => refetch());
    } else {
      createMatchType(matchType).then(() => refetch());
    }

    modals.closeAll();
  };

  return (
    <AdminEditModal isCreate={!data} onSubmit={handleSubmit(onSubmit)}>
      <Grid.Col span={{ base: 12, sm: 8 }}>
        <Input.Wrapper label="Название" withAsterisk>
          <Input
            placeholder="Полное название"
            {...register('fullName', { required: true })}
          />
        </Input.Wrapper>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Input.Wrapper label="Короткое название" withAsterisk>
          <Input
            placeholder="Короткое название"
            {...register('name', { required: true })}
          />
        </Input.Wrapper>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 12 }}>
        {!isClubsLoading && (
          <MultiSelect
            label="Команды"
            searchable
            data={clubsData?.clubs.map((club) => ({
              value: String(club.id),
              label: club.name,
            }))}
            value={watch('clubs')}
            onChange={(values) => setValue('clubs', values)}
            defaultValue={data?.clubs}
          />
        )}
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Select
          data={TYPES.map((item) => ({
            value: item.id,
            label: item.label,
          }))}
          label="Тип"
          placeholder="Тип"
          withAsterisk
          maxDropdownHeight={200}
          allowDeselect={false}
          {...register('type', { required: true })}
          onChange={(_, option) =>
            setValue('type', option.value as TForm['type'])
          }
          defaultValue={TYPES[0].id}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 6, sm: 2 }}>
        <Input.Wrapper label="Год">
          <Input
            placeholder="Год"
            type="number"
            step={1}
            {...register('year', { valueAsNumber: true })}
          />
        </Input.Wrapper>
      </Grid.Col>
      <Grid.Col span={{ base: 3, sm: 2 }}>
        <Input.Wrapper label="Архивный">
          <Flex align="center" h={36}>
            <Switch
              {...register('isArchive')}
              color="violet"
              defaultChecked={data?.isArchive ?? false}
            />
          </Flex>
        </Input.Wrapper>
      </Grid.Col>
    </AdminEditModal>
  );
};
