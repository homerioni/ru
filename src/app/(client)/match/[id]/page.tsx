import { MatchInfo } from '@/components/client/MatchInfo';
import { BetEvent } from '@/components/client/BetEvent';
import { MatchTabs } from '@/components/client/MatchTabs';
import { getMatch } from '@/services';
export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const match = await getMatch(id);

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
