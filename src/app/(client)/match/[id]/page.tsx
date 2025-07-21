import { MatchInfo } from '@/components/client/MatchInfo';
import { BetEvent } from '@/components/client/BetEvent';
import { MatchTabs } from '@/components/client/MatchTabs';
import { getMatch } from '@/services';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MatchPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const match = await getMatch(id);

  if (!match) {
    redirect('/');
  }

  return (
    <>
      {match.betEvent && <MatchTabs />}
      <MatchInfo data={match} />
      {match.betEvent && (
        <BetEvent
          match={match}
          events={match.betEvent.events}
          isCompleted={match.betEvent.isCompleted}
        />
      )}
    </>
  );
}
