import type { GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type DefaultUser,
  type NextAuthOptions,
  type User,
} from "next-auth";
import { type DefaultJWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "../env.mjs";
import { http } from "./http";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    username: string;
    token: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    user: User;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: env.NEXTAUTH_SECRET,
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.user = user;
      }
      return token;
    },
    session({ session, token }) {
      if (token && token.user && session.user) {
        session.user.id = token.user.id;
        session.user.name = token.user.username;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", required: true },
        password: { label: "Password", type: "password", required: true },
      },
      async authorize(credentials): Promise<User | null> {
        try {
          const data = await http.request<User>(
            `${env.CREDENTIALS_PROVIDER_URL}/api/login`,
            {
              method: "POST",
              body: JSON.stringify(credentials),
              headers: { "Content-Type": "application/json" },
            },
          );
          if (data) {
            return data;
          }
        } catch (error) {
          return null;
        }
        return null;
      },
    }),
  ],
  debug: false,
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
