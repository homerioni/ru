import { getVotesMatches } from '@/services';
import { MatchList } from '@/components/client/MatchList';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Голосования | Речичане United',
  description: 'Список голосований',
};

export default async function VotesPage() {
  const [votesMatches] = await Promise.all([getVotesMatches()]);

  console.log('votesMatches', votesMatches);

  return (
    <>
      <MatchList matches={votesMatches} />
    </>
  );
}
