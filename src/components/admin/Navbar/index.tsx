import { NavLink } from '@mantine/core';
import { adminRoutes } from '@/constants';
import { usePathname } from 'next/navigation';

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <>
      <NavLink
        label="Матчи"
        href={adminRoutes.games}
        active={pathname === adminRoutes.games}
      />
      <NavLink
        label="Наш состав"
        href={adminRoutes.team}
        active={pathname === adminRoutes.team}
      />
      <NavLink
        label="Команды"
        href={adminRoutes.clubs}
        active={pathname === adminRoutes.clubs}
      />
      <NavLink
        label="Типы матча"
        href={adminRoutes.types}
        active={pathname === adminRoutes.types}
      />
      <NavLink
        label="Трансферы"
        href={adminRoutes.transfers}
        active={pathname === adminRoutes.transfers}
      />
      <NavLink
        label="Объявления на сайте"
        href={adminRoutes.siteUpdates}
        active={pathname === adminRoutes.siteUpdates}
      />
    </>
  );
};
