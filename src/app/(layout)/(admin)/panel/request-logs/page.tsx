'use client';

import { useMemo, useState } from 'react';
import {
  Badge,
  Center,
  Code,
  Pagination,
  ScrollArea,
  Stack,
  Table,
  TextInput,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { getAdminRequestLogs } from '@/services';

const statusToColor = (status?: number) => {
  if (!status) {
    return 'gray';
  }

  if (status >= 500) {
    return 'red';
  }

  if (status >= 400) {
    return 'orange';
  }

  if (status >= 300) {
    return 'yellow';
  }

  return 'green';
};

export default function AdminRequestLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const searchDebounced = useDebounce(search, 350);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-request-logs', page, searchDebounced],
    queryFn: () =>
      getAdminRequestLogs({
        page,
        qty: 50,
        search: searchDebounced || undefined,
      }),
  });

  const rows = useMemo(
    () =>
      data?.logs.map((log) => (
        <Table.Tr key={log.id}>
          <Table.Td>{new Date(log.createdAt).toLocaleString('ru-RU')}</Table.Td>
          <Table.Td>{log.adminUsername || '-'}</Table.Td>
          <Table.Td>{log.adminUserId || '-'}</Table.Td>
          <Table.Td>{log.clubAdminId ?? '-'}</Table.Td>
          <Table.Td>{log.method}</Table.Td>
          <Table.Td>{log.path}</Table.Td>
          <Table.Td>
            <Badge
              color={statusToColor(log.statusCode ?? undefined)}
              variant="light"
            >
              {log.statusCode ?? '-'}
            </Badge>
          </Table.Td>
          <Table.Td>
            <Code block maw={500} mah={140} style={{ overflow: 'auto' }}>
              {log.payload || '-'}
            </Code>
          </Table.Td>
          <Table.Td>
            <Code block maw={500} mah={140} style={{ overflow: 'auto' }}>
              {log.query || '-'}
            </Code>
          </Table.Td>
        </Table.Tr>
      )),
    [data]
  );

  return (
    <Stack gap={10}>
      <TextInput
        placeholder="Поиск по username, path, method или payload"
        value={search}
        onChange={(event) => {
          setPage(1);
          setSearch(event.currentTarget.value);
        }}
      />

      <ScrollArea>
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Дата</Table.Th>
              <Table.Th>Admin</Table.Th>
              <Table.Th>User ID</Table.Th>
              <Table.Th>Club ID</Table.Th>
              <Table.Th>Method</Table.Th>
              <Table.Th>Path</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Payload</Table.Th>
              <Table.Th>Query</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </ScrollArea>

      {!isLoading && data?.totalPages && data.totalPages > 1 && (
        <Center>
          <Pagination total={data.totalPages} value={page} onChange={setPage} />
        </Center>
      )}
    </Stack>
  );
}
