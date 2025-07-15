import { GamesTableWrapper } from '@/components/client/GamesTableWrapper';
import { getMatchTypes } from '@/services/matchTypes';

export const dynamic = 'force-dynamic';

export default async function TablesPage() {
  const tables = await getMatchTypes().then((res) =>
    res.filter((type) => !type.isArchive && type.isLeague)
  );

  return (
    <>
      <GamesTableWrapper tables={tables} />
    </>
  );
}
