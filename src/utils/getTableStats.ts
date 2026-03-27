import { ClubStats } from '@/app/(client)/tables/page';
import { getMatchType } from '@/services/matchTypes';

export const getTableStats = (
  type: Awaited<ReturnType<typeof getMatchType>>
) => {
  const clubMap = new Map<number, ClubStats>();

  type.clubs.forEach((club) => {
    clubMap.set(club.id, {
      club,
      matches: [],
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals: 0,
      missed: 0,
      goalDifference: 0,
      points: 0,
    });
  });

  for (const match of type.matches) {
    const { homeClub, awayClub, score } = match;

    if (!score || score.length !== 2) continue;

    const [homeGoals, awayGoals] = score;

    for (const [club, isHome] of [
      [homeClub, true],
      [awayClub, false],
    ] as const) {
      const stats = clubMap.get(club.id)!;

      stats.matches.push(match);
      stats.played += 1;

      const isWin =
        (isHome && homeGoals > awayGoals) || (!isHome && awayGoals > homeGoals);
      const isDraw = homeGoals === awayGoals;

      if (isWin) {
        stats.wins += 1;
        stats.points += 3;
      } else if (isDraw) {
        stats.draws += 1;
        stats.points += 1;
      } else {
        stats.losses += 1;
      }

      const goalsFor = isHome ? homeGoals : awayGoals;
      const goalsAgainst = isHome ? awayGoals : homeGoals;

      stats.goals += goalsFor;
      stats.missed += goalsAgainst;
      stats.goalDifference = stats.goals - stats.missed;
    }
  }

  const clubsWithStats = Array.from(clubMap.values());

  clubsWithStats.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.goalDifference - a.goalDifference;
  });

  return clubsWithStats;
};
