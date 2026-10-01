import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
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
  console.log("LOGIN ATTEMPT");
  console.log("Email received:", credentials?.email);
  console.log("Expected email:", process.env.DEV_AUTH_EMAIL);
  console.log("Password received:", credentials?.password ? "YES" : "NO");
  console.log(
    "Password matches:",
    credentials?.password === process.env.DEV_AUTH_PASSWORD
  );
  console.log("User ID:", process.env.DEV_AUTH_USER_ID);

  if (
    credentials?.email !== process.env.DEV_AUTH_EMAIL ||
    credentials?.password !== process.env.DEV_AUTH_PASSWORD
  ) {
    console.log("AUTH FAILED");
    return null;
  }

  console.log("AUTH SUCCESS");

  return {
    id: process.env.DEV_AUTH_USER_ID!,
    name: "Development User",
    email: credentials.email as string,
  };
},
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id =
          (token.id as string) ??
          (token.sub as string);
      }

      return session;
    },
  },
});