import { Button, Flex, Grid } from '@mantine/core';
import { modals } from '@mantine/modals';

type TAdminEditModalProps = {
  isCreate: boolean;
  onSubmit: () => void;
  loading?: boolean;
  disabled?: boolean;
  isDisabledSubmit?: boolean;
  children: React.ReactNode;
};

export const AdminEditModal = ({
  isCreate,
  onSubmit,
  loading,
  disabled,
  isDisabledSubmit,
  children,
}: TAdminEditModalProps) => {
  const isLoading = loading ?? isDisabledSubmit ?? false;
  const isDisabled = disabled ?? isDisabledSubmit ?? isLoading;

  return (
    <form onSubmit={onSubmit}>
      <Grid gutter={10}>
        {children}
        <Grid.Col span={12} style={{ marginTop: '1rem' }}>
          <Flex gap={5}>
            <Button
              type="submit"
              variant="outline"
              color={isCreate ? 'green' : undefined}
              loading={isLoading}
              disabled={isDisabled}
            >
              {isCreate ? 'Создать' : 'Сохранить'}
            </Button>
            <Button
              type="button"
              variant="transparent"
              color="gray"
              onClick={() => modals.closeAll()}
              disabled={isLoading}
            >
              Отменить
            </Button>
          </Flex>
        </Grid.Col>
      </Grid>
    </form>
  );
};
