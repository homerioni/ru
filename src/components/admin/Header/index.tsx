import { Burger, Button, Flex, Skeleton, Text, Title } from '@mantine/core';
import { signOut, useSession } from 'next-auth/react';

type THeaderProps = {
  menuIsOpen: boolean;
  burgerClick: () => void;
};

const LoginComponent = () => {
  const { data, status } = useSession();

  if (status === 'loading') {
    return (
      <Flex align="center" gap={16}>
        <Skeleton height={32} circle />
        <Skeleton width={80} height={36} />
      </Flex>
    );
  }

  return (
    <Flex align="center" gap={16} justify="flex-end" ml="auto">
      <Text>{data?.user?.name}</Text>
      <Button onClick={() => signOut()}>Выйти</Button>
    </Flex>
  );
};

export const Header = ({ menuIsOpen, burgerClick }: THeaderProps) => {
  return (
    <Flex align="center" justify="space-between" px={16} h="100%">
      <Title h={50} py={8} order={3} display={{ base: 'none', sm: 'block' }}>
        ADMIN PANEL v0.1
      </Title>
      <Burger
        display={{ base: 'block', sm: 'none' }}
        opened={menuIsOpen}
        onClick={burgerClick}
      />
      <LoginComponent />
    </Flex>
  );
};
