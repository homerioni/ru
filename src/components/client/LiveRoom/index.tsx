import type { LiveBroadcast } from '@prisma/client';
import { LiveRoomClient } from './LiveRoomClient';

type LiveRoomProps = {
  broadcast: LiveBroadcast;
};

export const LiveRoom = ({ broadcast }: LiveRoomProps) => {
  return <LiveRoomClient broadcast={broadcast} />;
};
