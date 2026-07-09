import { LiveChatMessage } from '@prisma/client';
import { apiRoutes } from '@/constants';
import { axiosInstance } from './index';

export const getLiveChatMessages = async (
  broadcastId: string,
  after?: string
) => {
  const params = new URLSearchParams({ broadcastId });
  if (after) params.set('after', after);

  const { data } = await axiosInstance.get<{ messages: LiveChatMessage[] }>(
    `${apiRoutes.liveChat}?${params.toString()}`
  );

  return data.messages;
};

export const postLiveChatMessage = async (payload: {
  broadcastId: string;
  message: string;
  guestName?: string;
}) => {
  const { data } = await axiosInstance.post<LiveChatMessage>(
    apiRoutes.liveChat,
    payload
  );

  return data;
};
