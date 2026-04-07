import { Providers } from '@/components/client/Providers';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
