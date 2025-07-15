import { getTop } from '@/services/top';
import { Top } from '@/components/client/Top';

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const top = await getTop();

  return (
    <>
      <Top data={top} />
    </>
  );
}
