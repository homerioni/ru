import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth'; // I'll put it in lib/auth.ts to be widely available if needed, or I can just not export it in route.ts

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
