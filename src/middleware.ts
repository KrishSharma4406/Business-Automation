import { NextResponse } from "next/server";

import { auth } from "@/src/lib/auth";

export default auth((request) => {
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
