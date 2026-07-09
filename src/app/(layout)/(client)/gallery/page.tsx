import { ClubGallery } from '@/components/client/ClubGallery';
import { MY_CLUB_ID } from '@/constants';
import { getClubPhotos } from '@/services';
import { BackLink } from '@ui/BackLink';
import s from './styles.module.scss';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Фотогалерея | Речичане United',
  description: 'Фотогалерея клуба Речичане United',
};

export default async function GalleryPage() {
  const photos = await getClubPhotos(MY_CLUB_ID);

  return (
    <>
      <div className={`${s.backLink} container`}>
        <BackLink href="/" />
      </div>
      <ClubGallery photos={photos} />
    </>
  );
}
