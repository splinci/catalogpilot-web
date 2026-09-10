import { userRepository, UserRepository } from '@/repositories/user.repository';
import { auditService, AuditService } from './audit.service';
import { hashPassword, verifyPassword, signAccessToken, createSessionCookie, destroySessionCookie, getCurrentSession } from '@/lib/auth';
import { LoginRequest, LoginResponse, UserSessionPayload } from '@/types/auth.dto';
import { AuditAction, Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class AuthenticationService {
  constructor(
    private userRepo: UserRepository = userRepository,
    private audit: AuditService = auditService
  ) {}

  async login(request: LoginRequest, ipAddress?: string): Promise<LoginResponse> {
    const normalizedEmail = request.email.toLowerCase().trim();
    const user = await this.userRepo.findByEmail(normalizedEmail);

    if (!user || !user.isActive) {
      if (user) {
        await this.audit.log({
          companyId: user.companyId,
          userId: user.id,
          action: AuditAction.LOGIN_FAILED,
          entityName: 'User',
          entityId: user.id,
          details: { reason: 'User inactive' },
          ipAddress,
        });
      }
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await verifyPassword(user.passwordHash, request.password);

    if (!isValidPassword) {
      await this.audit.log({
        companyId: user.companyId,
        userId: user.id,
        action: AuditAction.LOGIN_FAILED,
        entityName: 'User',
        entityId: user.id,
        details: { reason: 'Invalid password' },
        ipAddress,
      });
      throw new Error('Invalid email or password');
    }

    const sessionPayload: UserSessionPayload = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companyId: user.companyId,
      companyCode: user.company?.code || 'SPLINCI',
      companyName: user.company?.legalName || 'Splinci Enterprise',
    };

    const token = await signAccessToken(sessionPayload);
    await createSessionCookie(token);

    await this.userRepo.updateLastLogin(user.id);
    await this.audit.log({
      companyId: user.companyId,
      userId: user.id,
      action: AuditAction.LOGIN,
      entityName: 'User',
      entityId: user.id,
      details: { email: user.email, role: user.role },
      ipAddress,
    });

    return {
      success: true,
      message: 'Login successful',
      user: sessionPayload,
    };
  }

  async logout(session: UserSessionPayload | null, ipAddress?: string): Promise<void> {
    if (session) {
      await this.audit.log({
        companyId: session.companyId,
        userId: session.userId,
        action: AuditAction.LOGOUT,
        entityName: 'User',
        entityId: session.userId,
        ipAddress,
      });
    }
    await destroySessionCookie();
  }

  async getCurrentUser(): Promise<UserSessionPayload | null> {
    return getCurrentSession();
  }
}

export const authenticationService = new AuthenticationService();
