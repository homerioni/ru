import { ClubGallery } from '@/components/client/ClubGallery';
import { getClubPhotosFromDb } from '@/lib/clubPhotos';
import { getClub } from '@/services';
import { BackLink } from '@ui/BackLink';
import s from './styles.module.scss';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const club = await getClub(+clubId);

  return {
    title: `Фотогалерея | ${club?.name ?? 'Клуб'}`,
    description: `Фотогалерея клуба ${club?.name ?? ''}`,
  };
}

export default async function ClubGalleryPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;

  const photos = await getClubPhotosFromDb(+clubId);

  return (
    <>
      <div className={s.backLink}>
        <BackLink href={`/club/${clubId}`} />
      </div>
      <ClubGallery photos={photos} />
    </>
  );
}
