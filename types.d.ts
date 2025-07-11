/// <reference types="styled-components/cssprop" />
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
    role?: ROLE; // или ROLE, если используете enum
  }

  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: ROLE; // или ROLE
    };
  }
}
