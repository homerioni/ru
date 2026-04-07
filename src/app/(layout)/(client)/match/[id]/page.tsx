import { MatchInfo } from '@/components/client/MatchInfo';
import { getMatch } from '@/services';
import { redirect } from 'next/navigation';
import { MyMap } from '@/components/client/Map';
import s from '@/app/(layout)/(clubs)/club/[clubId]/matches/styles.module.scss';
import { BackLink } from '@ui/BackLink';

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
    <section className={s.main}>
      <div className={s.backLink}>
        <BackLink />
      </div>
      <MatchInfo data={match} />
      <MyMap />
    </section>
  );
}
