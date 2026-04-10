import { createUserOrUpdate, prisma } from '@/lib/prisma';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { objectToAuthDataMap, AuthDataValidator } from '@telegram-auth/server';
import { ROLE } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'telegram-login',
      name: 'Telegram Login',
      credentials: {},
      async authorize(credentials, req) {
        const validator = new AuthDataValidator({
          botToken: `${process.env.TELEGRAM_BOT_TOKEN}`,
        });

        const data = objectToAuthDataMap(req.query || {});
        const user = await validator.validate(data);

        if (user.id && user.first_name) {
          let dbUser;
          try {
            dbUser = await createUserOrUpdate(user);
          } catch (e) {
            console.log('Something went wrong while creating the user.', e);
          }

          const returned = {
            id: user.id.toString(),
            email: user.id.toString(),
            name: [user.first_name, user.last_name || ''].join(' '),
            image: user.photo_url,
            username: user.username,
            clubAdminId: dbUser?.clubAdminId ?? null,
            role: dbUser?.role || 'USER',
          };

          return returned;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.clubAdminId = user.clubAdminId;
      }

      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, clubAdminId: true, username: true },
          });

          if (dbUser) {
            token.role = dbUser.role;
            token.clubAdminId = dbUser.clubAdminId;
            token.username = dbUser.username;
          }
        } catch (e) {
          console.error('Error fetching user in jwt callback', e);
        }
      }

      if (trigger === 'update' && session?.role) {
        token.role = session.role;
      }

      if (trigger === 'update' && session?.clubAdminId) {
        token.clubAdminId = session.clubAdminId;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || session.user.email;
        session.user.username = token.username as string;
        session.user.role = token.role as ROLE;
        session.user.clubAdminId = token.clubAdminId as number | null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
};
