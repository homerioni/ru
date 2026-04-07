import { ClubStats } from '@/app/(layout)/(client)/tables/page';

export type LeagueTableProps = {
  data: ClubStats[];
  title?: string;
  myClubId: number;
};
