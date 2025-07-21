import { GamesTableWrapper } from '@/components/client/GamesTableWrapper';
import { getMatchTypes } from '@/services/matchTypes';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Турниры | Речичане United',
  description: 'Турниры в которых учавствует клуб Речичане United',
};

export default async function TablesPage() {
  const tables = await getMatchTypes();

  return (
    <>
      <GamesTableWrapper tables={tables} />
    </>
  );
}
