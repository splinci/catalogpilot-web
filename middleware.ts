import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

const PUBLIC_ROUTES = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Next.js internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // User is NOT logged in
  if (!sessionToken && !isPublicRoute) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  // User is already logged in
  if (sessionToken && isPublicRoute) {
    return NextResponse.redirect(
      new URL("/", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\.).*)"],
};