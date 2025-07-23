import { MatchInfo } from '@/components/client/MatchInfo';
import { getMatch } from '@/services';
import { redirect } from 'next/navigation';
import { MyMap } from '@/components/client/Map';

export const dynamic = 'force-dynamic';

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const match = await getMatch(id);

  if (!match) {
    redirect('/');
  }

  return (
    <>
      <MatchInfo data={match} />
      <MyMap />
    </>
  );
}
