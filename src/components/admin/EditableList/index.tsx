import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { Center, Checkbox, Table } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Product } from '@prisma/client';
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import s from './styles.module.scss';

type TEditableListProps = {
  selectedItems: Product[];
  setSelectedItems: Dispatch<SetStateAction<Product[]>>;
  columns: readonly { width?: number; minWidth?: number; name: string }[];
  data: { product: Product; tableData: React.ReactNode[] }[];
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

  const onCheckbox = (e: ChangeEvent<HTMLInputElement>, item: Product) =>
    setSelectedItems((prev) =>
      e.target.checked ? [...prev, item] : prev.filter((product) => product.id !== item.id)
    );

  const actionAllCheck = () =>
    setSelectedItems((prev) => (prev.length ? [] : data.map((item) => item.product)));

  const getBgColor = (id: number) =>
    selectedItems.some((product) => product.id === id)
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
      stickyHeaderOffset={isMobile ? 250 : 110}
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
          <Table.Tr key={row.product.id} bg={getBgColor(row.product.id)}>
            <Table.Td>
              <Checkbox
                checked={selectedItems.some((item) => item.id === row.product.id)}
                onChange={(e) => onCheckbox(e, row.product)}
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
