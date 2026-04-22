import { getRecentClosedVotesMatches, getVotesMatches } from '@/services';
import { MatchList } from '@/components/client/MatchList';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Голосования | Речичане United',
  description: 'Список голосований',
};

export default async function VotesPage() {
  const [votesMatches, recentClosedVotesMatches] = await Promise.all([
    getVotesMatches(),
    getRecentClosedVotesMatches(),
  ]);

  return (
    <>
      <MatchList matches={votesMatches} />
      <MatchList
        matches={recentClosedVotesMatches}
        title="Недавно завершенные голосования"
      />
    </>
  );
}
