import { TeamCard } from '@/components/client/TeamCard';
import s from './styles.module.scss';

export const Team = () => {
  return (
    <section className={`${s.main} container`}>
      <TeamCard />
      <TeamCard />
      <TeamCard />
    </section>
  );
};
