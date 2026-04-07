import { redirect } from 'next/navigation';
import { adminRoutes } from '@/constants';

export default function PanelPage() {
  redirect(adminRoutes.games);
}
