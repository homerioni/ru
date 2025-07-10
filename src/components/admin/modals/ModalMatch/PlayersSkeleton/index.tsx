import { Flex, Skeleton, Space, Stack } from '@mantine/core';

export const PlayersSkeleton = () => {
  return (
    <Stack gap="xs">
      <Space h={10} />
      <Flex align="center" gap={16}>
        <Skeleton width={24} height={24} />
        <Skeleton width={200} height={24} />
        <Skeleton width={110} height={36} />
        <Skeleton width={110} height={36} />
      </Flex>
      <Flex align="center" gap={16}>
        <Skeleton width={24} height={24} />
        <Skeleton width={200} height={24} />
        <Skeleton width={110} height={36} />
        <Skeleton width={110} height={36} />
      </Flex>
      <Flex align="center" gap={16}>
        <Skeleton width={24} height={24} />
        <Skeleton width={200} height={24} />
        <Skeleton width={110} height={36} />
        <Skeleton width={110} height={36} />
      </Flex>
    </Stack>
  );
};
