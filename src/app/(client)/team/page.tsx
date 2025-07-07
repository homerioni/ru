import img from 'src/assets/img/team.jpg';
import { Team } from '@/components/client/Team';
import { Intro } from '@/components/client/Intro';

export default function TeamPage() {
  return (
    <>
      <Intro imgSrc={img.src} alt={'Состав'} title={'Состав нашей команды'} />
      <Team />
    </>
  );
}
