import { axiosInstance } from '@/services/index';
import { apiRoutes } from '@/constants';
import { Club, Match, MatchType, MatchVote } from '@prisma/client';

export const createVote = async (
  vote: Omit<MatchVote, 'id' | 'createdAt' | 'updateAt'>
) => {
  const { data } = await axiosInstance.post(apiRoutes.matchVote, vote);

  return data;
};

export const startVote = async (id: number) => {
  const newMatch = {
    id,
    voteStatus: 'started',
    voteStartDate: new Date(),
  };
  const { data } = await axiosInstance.post(apiRoutes.match, newMatch);

  return data;
};

export const closeVote = async (
  id: number,
  info: { playerId: number; matchType: string; matchName: string; date: Date }
) => {
  const newMatch = {
    id,
    voteStatus: 'closed',
  };
  const { data } = await axiosInstance.post(apiRoutes.match, newMatch);

  await axiosInstance.post(apiRoutes.award, { type: 'match', ...info });

  return data;
};

export type TGetVoteMatch = Match & {
  awayClub: Club;
  homeClub: Club;
  type: MatchType;
};

export const getVotesMatches = async () => {
  const { data } = await axiosInstance.get<TGetVoteMatch[]>(
    apiRoutes.votesMatches
  );

  return data;
};
