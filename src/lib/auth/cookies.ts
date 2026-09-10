// src/lib/auth/cookies.ts

import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "./constants";

export async function setSessionCookie(
  token: string,
  expires: Date
) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAME);
}