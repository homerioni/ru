import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export * from './clubs';
export * from './matches';
export * from './players';
export * from './transfers';
export * from './upload';
export * from './vote';
