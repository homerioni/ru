import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { Center, Checkbox, Table } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Player, Match, Club } from '@prisma/client';
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import s from './styles.module.scss';

export type TEditableItem = Player | Match | Club;

type TEditableListProps = {
  selectedItems: TEditableItem[];
  setSelectedItems: Dispatch<SetStateAction<TEditableItem[]>>;
  columns: readonly {
    width?: number | string;
    minWidth?: number | string;
    name: string;
  }[];
  data: { data: TEditableItem; tableData: React.ReactNode[] }[];
};

const getContent = (item: React.ReactNode) => {
  switch (item) {
    case true:
      return (
        <Center>
          <IconCircleCheck color="green" />
        </Center>
      );
    case false:
      return (
        <Center>
          <IconCircleX color="red" />
        </Center>
      );
    case undefined:
      return undefined;
    default:
      return item;
  }
};

export const EditableList = ({
  selectedItems,
  setSelectedItems,
  columns,
  data,
}: TEditableListProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const onCheckbox = (e: ChangeEvent<HTMLInputElement>, item: TEditableItem) =>
    setSelectedItems((prev) =>
      e.target.checked
        ? [...prev, item]
        : prev.filter((data) => data.id !== item.id)
    );

  const actionAllCheck = () =>
    setSelectedItems((prev) =>
      prev.length ? [] : data.map((item) => item.data)
    );

  const getBgColor = (id: number) =>
    selectedItems.some((item) => item.id === id)
      ? 'var(--mantine-color-blue-light)'
      : undefined;

  const mainCheckboxIcon = selectedItems.length
    ? { indeterminate: data.length !== selectedItems.length }
    : undefined;

  return (
    <Table
      striped
      highlightOnHover
      tabularNums
      stickyHeader
      stickyHeaderOffset={isMobile ? 200 : 110}
      withRowBorders={false}
      className={s.table}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th w="0%">
            <Checkbox
              checked={!!selectedItems.length}
              onChange={actionAllCheck}
              {...mainCheckboxIcon}
            />
          </Table.Th>
          {columns.map((column, i) => (
            <Table.Th key={i} w={column.width} miw={column.minWidth}>
              {column.name}
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.map((row) => (
          <Table.Tr key={row.data.id} bg={getBgColor(row.data.id)}>
            <Table.Td>
              <Checkbox
                checked={selectedItems.some((item) => item.id === row.data.id)}
                onChange={(e) => onCheckbox(e, row.data)}
              />
            </Table.Td>
            {row.tableData.map((column, columnIndex) => (
              <Table.Td key={columnIndex}>{getContent(column)}</Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
};
