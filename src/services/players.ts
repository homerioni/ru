import { Player } from '@prisma/client';
import { apiRoutes } from '@/constants';
import { TCreatePlayerData, TGetPlayer, TGetPlayers } from '@/types';
import { axiosInstance } from './index';

type TGetPlayerProps = {
  search?: string;
  qty?: number;
  page?: string | number;
  clubId?: string;
};

type TGetPlayersResponse = {
  players: TGetPlayers[];
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
  const { data } = await axiosInstance.get<TGetPlayer>(apiRoutes.player, {
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
  const { data } = await axiosInstance.post(apiRoutes.player, {
    ...player,
    username: player.username?.startsWith('@')
      ? player.username.slice(1)
      : player.username,
  });

  return data;
};

export const updatePlayer = async (player: Player) => {
  const newData = {
    id: player.id,
    number: player.number,
    name: player.name,
    type: player.type,
    photo: player.photo,
    position: player.position,
    isShow: player.isShow,
    clubId: player.clubId,
    username: player.username?.startsWith('@')
      ? player.username.slice(1)
      : player.username,
  };

  const { data } = await axiosInstance.post(apiRoutes.updatePlayer, newData);

  return data;
};

export const updateProfilePlayer = async (player: Player) => {
  const newData = {
    id: player.id,
    photo: player.photo,
    instagram: player.instagram,
    telegram: player.telegram,
    tiktok: player.tiktok,
    vk: player.vk,
    youtube: player.youtube,
  };

  const { data } = await axiosInstance.post(apiRoutes.updatePlayer, newData);

  return data;
};
