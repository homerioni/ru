import { redirect } from 'next/navigation';
import { clubAdminRoutes } from '@/constants/routes';

export default function PanelPage() {
  redirect(clubAdminRoutes.games);
}
