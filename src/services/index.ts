import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export { createEvent, getEvent, deleteEvents, updateEvent } from './events';
export {
  updateClub,
  createClub,
  getClub,
  deleteClubs,
  getClubs,
} from './clubs';
export {
  createMatch,
  getMatch,
  deleteMatches,
  getMatches,
  updateMatch,
} from './matches';
export {
  createPlayer,
  getPlayer,
  getPlayers,
  updatePlayer,
  deletePlayers,
} from './players';
export { uploadImage } from './upload';
