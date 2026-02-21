import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  const requiredEnv = [
    "NEXTAUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "DATABASE_URL",
  ];

  for (const name of requiredEnv) {
    if (!process.env[name]) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
  }
}

async function syncUserProfile(user) {
  if (!user) return;

  const data = {
    name: user.name || null,
    profilePicture: user.image || null,
  };

  try {
    if (user.id) {
      const updated = await prisma.user.updateMany({
        where: { id: user.id },
        data,
      });

      if (updated.count > 0) {
        return;
      }
    }

    if (user.email) {
      await prisma.user.updateMany({
        where: { email: user.email },
        data,
      });
    }
  } catch (error) {
    console.error("[auth] profile sync failed", error);
  }
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
    maxAge: 60 * 60 * 24 * 30,
  },
  useSecureCookies: isProduction,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      await syncUserProfile(user);
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.profilePicture = user.profilePicture || user.image || null;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      await syncUserProfile(user);
    },
  },
  pages: {
    signIn: "/",
  },
  debug: false,
};
