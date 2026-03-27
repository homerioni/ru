import { getClubs } from '@/services';
import { ClubList } from '@/components/client/ClubList';
import { MY_CLUB_ID } from '@/constants';

export default async function ClubsPage() {
  const clubs = await getClubs().then((res) =>
    res.clubs.filter((club) => club.id !== MY_CLUB_ID && club.isShow)
  );

  return (
    <>
      <ClubList list={clubs} />
    </>
  );
}
