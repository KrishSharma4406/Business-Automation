import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.BETTER_AUTH_SECRET,

  trustHost: true,

  pages: {
    signIn: "/auth/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id =
          (token.id as string) ??
          (token.sub as string);
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
      }

      return session;
    },
  },

  providers: [],
} satisfies NextAuthConfig;
