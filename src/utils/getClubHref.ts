import { MY_CLUB_ID } from '@/constants';

export const getClubHref = (clubId: number | string) => {
  if (Number(clubId) === MY_CLUB_ID) {
    return '/';
  }

  return `/club/${clubId}`;
};
