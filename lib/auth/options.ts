import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators/auth";
import { validateCredentials } from "@/lib/auth/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/?auth=login"
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const result = await validateCredentials(parsed.data.email, parsed.data.password);
        if (!result.ok) {
          return null;
        }

        return {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          image: result.user.imageUrl,
          username: result.user.username
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.username = (user as { username?: string }).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.username = token.username as string | undefined;
      }
      return session;
    }
  }
};
