import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import bcrypt from "bcryptjs";
import { getUserByEmail, findOrCreateOAuthUser, linkOAuthAccount } from "@/src/lib/auth-db";
import { authConfig } from "@/src/lib/auth.config";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,

  providers: [
    // Google OAuth Provider
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    // Credentials Provider
    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const rawPassword = String(credentials.password);

        // 1. Authenticate against PostgreSQL database
        try {
          const user = await getUserByEmail(email);
          if (user && user.passwordHash) {
            const isValid = await bcrypt.compare(rawPassword, user.passwordHash);
            if (isValid) {
              return {
                id: user.id,
                name: user.name || "Operator",
                email: user.email,
              };
            }
          }
        } catch (dbErr) {
          console.error("Database user authorization error:", dbErr);
        }

        // 2. Fallback to development user credentials from env
        const devEmail = process.env.DEV_AUTH_EMAIL?.trim().toLowerCase();
        const devPassword = process.env.DEV_AUTH_PASSWORD;
        if (
          devEmail &&
          devPassword &&
          email === devEmail &&
          rawPassword === devPassword
        ) {
          return {
            id: process.env.DEV_AUTH_USER_ID || "8c1a01d1-1f11-42e5-a6d1-a7efc2622633",
            name: "Development User",
            email: email,
          };
        }

        return null;
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    async signIn({ user, account }) {
      // For OAuth sign-ins (Google), find or create user in DB
      if (account?.provider === "google" && user.email) {
        try {
          const dbUser = await findOrCreateOAuthUser({
            email: user.email,
            name: user.name || null,
          });

          // Link the OAuth account
          await linkOAuthAccount({
            userId: dbUser.id,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            accessToken: account.access_token || null,
            refreshToken: account.refresh_token || null,
            expiresAt: account.expires_at || null,
            tokenType: account.token_type || null,
            scope: account.scope || null,
            idToken: account.id_token || null,
          });

          // Override user.id so the JWT gets the DB user ID
          user.id = dbUser.id;
          user.name = dbUser.name;
        } catch (err) {
          console.error("Google OAuth signIn callback error:", err);
          return false;
        }
      }

      return true;
    },

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
});
