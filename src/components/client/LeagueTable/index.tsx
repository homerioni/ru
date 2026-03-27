import Image from 'next/image';
import { LeagueTableProps } from '@/components/client/LeagueTable/types';
import s from './styles.module.scss';

export const LeagueTable = ({ data, title, myClubId }: LeagueTableProps) => {
  return (
    <div className={s.main}>
      <div className={s.tableWrapper}>
        {title && <h2 className={s.title}>{title}</h2>}
        <table className={`${s.table} ${!title ? s.border : ''}`}>
          <thead>
            <tr>
              <th className={s.header}>#</th>
              <th className={s.header}>Клуб</th>
              <th className={s.header}>Название</th>
              <th className={s.header}>И</th>
              <th className={s.header}>В</th>
              <th className={s.header}>Н</th>
              <th className={s.header}>П</th>
              <th className={s.header}>ЗМ</th>
              <th className={s.header}>ПМ</th>
              <th className={s.header}>РМ</th>
              <th className={s.header}>Очки</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item, i) => (
              <tr
                key={item.club.id}
                className={item.club.id === myClubId ? s.myClub : undefined}
              >
                <td>{i + 1}</td>
                <td className={s.logo}>
                  <Image
                    src={item.club.logoSrc}
                    alt={item.club.name}
                    width={200}
                    height={200}
                  />
                </td>
                <td className={s.name}>{item.club.name}</td>
                <td>{item.played}</td>
                <td>{item.wins}</td>
                <td>{item.draws}</td>
                <td>{item.losses}</td>
                <td>{item.goals}</td>
                <td>{item.missed}</td>
                <td>{item.goalDifference}</td>
                <td>{item.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
