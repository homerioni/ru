import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export * from './clubs';
export * from './matches';
export * from './players';
export * from './transfers';
export * from './upload';
export * from './vote';
export * from './siteUpdates';
export * from './clubPhotos';
export * from './adminRequestLogs';
export * from './broadcast';
export * from './liveChat';
