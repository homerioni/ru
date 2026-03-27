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
    username?: string;
    clubAdminId: number | null;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
      role: ROLE;
      clubAdminId: number | null;
      username: string;
    };
  }
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}
