import s from '@/components/client/MatchesCupList/styles.module.scss';
import { getMatchDate } from '@/utils/getMatchDate';
import { MatchItem } from '@/components/client/MatchItem';
import { TGetMatch } from '@/services';
import { LeagueTable } from '@/components/client/LeagueTable';
import { MY_CLUB_ID } from '@/constants';
import { getTableStats } from '@/utils/getTableStats';
import { Club, MatchType } from '@prisma/client';

type MatchesCupListItemProps = {
  round: string;
  toggleRound: () => void;
  roundTitle: string;
  isCollapsed: boolean;
  matchList: TGetMatch[];
  type: MatchType & { clubs: Club[] };
};

export const MatchesCupListItem = ({
  round,
  toggleRound,
  roundTitle,
  isCollapsed,
  matchList,
  type,
}: MatchesCupListItemProps) => (
  <div className={s.listWrapper}>
    <div className={s.listHeader} onClick={toggleRound}>
      <h3 className={s.listTitle}>{roundTitle}</h3>
      <button
        className={`${s.toggleBtn} ${isCollapsed ? s.collapsed : ''}`}
        aria-label={isCollapsed ? 'Развернуть' : 'Свернуть'}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
    {!isCollapsed && (
      <>
        {round.startsWith('group') && (
          <LeagueTable
            data={getTableStats({ ...type, matches: matchList })}
            myClubId={MY_CLUB_ID}
          />
        )}
        <ul className={s.list}>
          {matchList.map((match) => {
            const matchDate = getMatchDate(match.date);

            return (
              <li key={match.id} className={s.match}>
                <MatchItem
                  id={match.id}
                  clubs={[match.homeClub, match.awayClub]}
                  type={match.type.name}
                  date={`${matchDate.day}, ${matchDate.time}`}
                  score={match.score}
                />
              </li>
            );
          })}
        </ul>
      </>
    )}
  </div>
);
