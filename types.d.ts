import 'next-auth';
import { ROLE } from '@prisma/client';

declare module '*.png';
declare module '*.jpg';
declare module '*.svg';
declare module '*.graphql';
declare module '*.mp4' {
  const src: string;
  export default src;
}
declare module 'next-auth' {
  interface User {
    role?: ROLE;
    points?: number;
  }

  interface Session {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: ROLE;
      points?: number;
    };
  }
}
