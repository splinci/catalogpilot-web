import { z } from 'zod';
import { Role } from '@prisma/client';

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export interface UserSessionPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  companyId: string;
  companyCode: string;
  companyName: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: UserSessionPayload;
}

export interface SessionResponse {
  authenticated: boolean;
  user: UserSessionPayload | null;
}

export interface CurrentUserResponse {
  success: boolean;
  user: UserSessionPayload | null;
}
