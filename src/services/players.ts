import { Player } from '@prisma/client';
import { apiRoutes } from '@/constants';
import { TCreatePlayerData, TGetPlayer } from '@/types';
import { axiosInstance } from './index';

type TGetPlayerProps = {
  search?: string;
  qty?: number;
  page?: string | number;
};

type TGetPlayersResponse = {
  players: TGetPlayer[];
  totalCount: number;
  activePage: number;
  totalPages: number;
};

export const getPlayers = async (params?: TGetPlayerProps) => {
  const { data } = await axiosInstance.get<TGetPlayersResponse>(
    apiRoutes.players,
    { params }
  );

  return data;
};

export const getPlayer = async (id: number | string) => {
  const { data } = await axiosInstance.get<Player>(apiRoutes.player, {
    params: { id },
  });

  return data;
};

export const deletePlayers = async (ids: number[]) => {
  const { data } = await axiosInstance.delete(apiRoutes.players, {
    params: { ids: ids.join(',') },
  });

  return data;
};

export const createPlayer = async (player: TCreatePlayerData) => {
  const { data } = await axiosInstance.post(apiRoutes.player, player);

  return data;
};

export const updatePlayer = async (player: Player) => {
  const newData = {
    id: player.id,
    number: +player.number,
    name: player.name,
    photo: player.photo,
    position: player.position,
    isShow: player.isShow,
  };

  const { data } = await axiosInstance.post(apiRoutes.updatePlayer, newData);

  return data;
};
