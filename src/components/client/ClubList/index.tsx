import { Club } from '@prisma/client';
import Image from 'next/image';
import s from './styles.module.scss';
import Link from 'next/link';

type ClubListProps = {
  list: Club[];
};

export const ClubList = ({ list }: ClubListProps) => {
  return (
    <div className={s.main}>
      <ul className={s.list}>
        {list.map((club) => (
          <li key={club.id} className={s.item}>
            <Link href={`/club/${club.id}`}>
              <Image src={club.logoSrc} alt={''} width={256} height={256} />
              <h2>{club.name}</h2>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
