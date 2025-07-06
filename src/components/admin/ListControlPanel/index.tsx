import { Dispatch, SetStateAction } from 'react';
import { Button, Flex, Input } from '@mantine/core';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';

type TListControlPanelProps = {
  selectedLength: number;
  searchState?: [string, Dispatch<SetStateAction<string>>];
  onAdd: () => void;
  onEdit: () => void;
  onDel: () => void;
};

export const ListControlPanel = ({
  selectedLength,
  searchState,
  onAdd,
  onEdit,
  onDel,
}: TListControlPanelProps) => (
  <Flex
    gap={10}
    direction={{ base: 'column', sm: 'row' }}
    style={{ position: 'sticky', top: 65, zIndex: 5 }}
  >
    <Button
      flex="none"
      color="green"
      variant="light"
      onClick={onAdd}
      leftSection={<IconPlus size={20} stroke={1.5} />}
    >
      Добавить
    </Button>
    <Button
      flex="none"
      variant="light"
      onClick={onEdit}
      disabled={selectedLength !== 1}
      leftSection={<IconEdit size={20} stroke={1.5} />}
    >
      Редактировать
    </Button>
    <Button
      flex="none"
      variant="light"
      color="red"
      onClick={onDel}
      disabled={!selectedLength}
      leftSection={<IconTrash size={20} stroke={1.5} />}
    >
      Удалить
    </Button>
    {searchState && (
      <Input
        flex="none"
        placeholder="Поиск"
        leftSection={<IconSearch size={20} />}
        w={{ base: '100%', sm: 300 }}
        radius={0}
        styles={{
          input: { border: 'none', borderBottom: '1px solid var(--input-bd)' },
        }}
        value={searchState[0]}
        onChange={(e) => searchState[1](e.target.value)}
      />
    )}
  </Flex>
);
