import { AuthOptions } from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import * as process from 'node:process';
import { prisma } from '../../prisma/prisma-client';

export const nextAuthConfig: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (user?.role && session.user) {
        session.user.role = user.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
};
