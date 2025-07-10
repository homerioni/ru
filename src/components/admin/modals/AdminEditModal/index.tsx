import { Button, Flex, Grid } from '@mantine/core';
import { modals } from '@mantine/modals';

type TAdminEditModalProps = {
  isCreate: boolean;
  onSubmit: () => void;
  isDisabledSubmit?: boolean;
  children: React.ReactNode;
};

export const AdminEditModal = ({
  isCreate,
  onSubmit,
  isDisabledSubmit,
  children,
}: TAdminEditModalProps) => {
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
              loading={isDisabledSubmit}
            >
              {isCreate ? 'Создать' : 'Сохранить'}
            </Button>
            <Button
              type="button"
              variant="transparent"
              color="gray"
              onClick={() => modals.closeAll()}
              disabled={isDisabledSubmit}
            >
              Отменить
            </Button>
          </Flex>
        </Grid.Col>
      </Grid>
    </form>
  );
};
