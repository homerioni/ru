import { SubmitHandler, useForm } from 'react-hook-form';
import { Flex, Grid, Input, Switch } from '@mantine/core';
import { modals } from '@mantine/modals';
import { MatchType } from '@prisma/client';
import { AdminEditModal } from '@/components/admin/modals/AdminEditModal';
import { createMatchType, updateMatchType } from '@/services/matchTypes';

type TModalMatchTypeProps = {
  data?: MatchType;
  refetch: () => void;
};

type TForm = Omit<MatchType, 'id'>;

export const ModalMatchType = ({ data, refetch }: TModalMatchTypeProps) => {
  const { register, handleSubmit } = useForm<TForm>({
    defaultValues: data ?? {},
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
        <Input.Wrapper label="Турнир">
          <Flex align="center" h={36}>
            <Switch
              {...register('isLeague')}
              color="violet"
              defaultChecked={data?.isLeague ?? false}
            />
          </Flex>
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
