import { ClubStats } from '@/app/(client)/tables/page';

export type LeagueTableProps = {
  data: ClubStats[];
  title?: string;
  myClubId: number;
};
