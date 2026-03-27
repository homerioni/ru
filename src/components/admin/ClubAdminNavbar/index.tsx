import { NavLink } from '@mantine/core';
import { usePathname } from 'next/navigation';
import { clubAdminRoutes } from '@/constants/routes';

export const ClubAdminNavbar = () => {
  const pathname = usePathname();

  return (
    <>
      <NavLink
        label="Матчи"
        href={clubAdminRoutes.games}
        active={pathname === clubAdminRoutes.games}
      />
      <NavLink
        label="Наш состав"
        href={clubAdminRoutes.team}
        active={pathname === clubAdminRoutes.team}
      />
      <NavLink
        label="Клуб"
        href={clubAdminRoutes.clubs}
        active={pathname === clubAdminRoutes.clubs}
      />
      <NavLink
        label="Трансферы"
        href={clubAdminRoutes.transfers}
        active={pathname === clubAdminRoutes.transfers}
      />
    </>
  );
};
