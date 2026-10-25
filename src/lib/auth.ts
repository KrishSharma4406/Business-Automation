import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/src/lib/auth-db";
import { authConfig } from "@/src/lib/auth.config";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,

  providers: [
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
});
