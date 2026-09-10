// src/lib/auth/constants.ts

export const SESSION_COOKIE_NAME = "atlas_session";

export const SESSION_DURATION_MS =
  1000 * 60 * 60 * 24 * 7; // 7 days

export const SESSION_IDLE_TIMEOUT_MS =
  1000 * 60 * 30; // 30 minutes

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_MAX_LENGTH = 128;