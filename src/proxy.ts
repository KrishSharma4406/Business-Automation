import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/src/lib/auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth((request) => {
  if (!request.auth) {
    const loginUrl = new URL(
      "/auth/login",
      request.nextUrl.origin
    );

    loginUrl.searchParams.set(
      "callbackUrl",
      request.nextUrl.pathname
    );

    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};

