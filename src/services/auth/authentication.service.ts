import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  generateSessionToken,
  hashSessionToken,
  calculateSessionExpiry,
} from "@/lib/auth/session";

import { AuditAction } from "@prisma/client";

import { UserRepository } from "@/repositories/auth/user.repository";
import { SessionRepository } from "@/repositories/auth/session.repository";
import { RoleRepository } from "@/repositories/auth/role.repository";
import { AuditRepository } from "@/repositories/auth/audit.repository";

import {
  LoginRequestDto,
  RegisterUserDto,
} from "@/types/auth";

export class AuthenticationService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly sessionRepository = new SessionRepository(),
    private readonly roleRepository = new RoleRepository(),
    private readonly auditRepository = new AuditRepository()
  ) {}

  private async validateActiveUser(user: { isActive: boolean }) {
    if (!user.isActive) {
      throw new Error("Account is not active.");
    }
  }

  private async createAuditLog(
    action: AuditAction,
    userId: string | null,
    entity: string,
    entityId?: string,
    ipAddress?: string
  ) {
    try {
      await this.auditRepository.log({
        userId: userId ?? undefined,
        action,
        entity,
        entityId,
        ipAddress,
      });
    } catch (error) {
      console.error("Failed to write audit log:", error);
    }
  }

  async register(dto: RegisterUserDto) {
    const existingUser = await this.userRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new Error("Email is already registered.");
    }

    const passwordHash = await hashPassword(dto.password);

    const user = await this.userRepository.create({
      companyId: dto.companyId,
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    await this.createAuditLog(
      AuditAction.USER_CREATED,
      user.id,
      "User",
      user.id
    );

    return {
      id: user.id,
      companyId: user.companyId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.isActive ? "ACTIVE" : "INACTIVE",
    };
  }

  async login(dto: LoginRequestDto) {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      await this.createAuditLog(
        AuditAction.LOGIN_FAILED,
        null,
        "Authentication"
      );

      throw new Error("Invalid email or password.");
    }

    const validPassword = await verifyPassword(
      user.passwordHash,
      dto.password
    );

    if (!validPassword) {
      await this.createAuditLog(
        AuditAction.LOGIN_FAILED,
        user.id,
        "Authentication",
        user.id
      );

      throw new Error("Invalid email or password.");
    }

    await this.validateActiveUser(user);

    const sessionToken = generateSessionToken();
    const tokenHash = hashSessionToken(sessionToken);
    const expiresAt = calculateSessionExpiry();

    await this.sessionRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    await this.userRepository.updateLastLogin(user.id);

    await this.createAuditLog(
      AuditAction.LOGIN,
      user.id,
      "Session"
    );

    return {
      token: sessionToken,
      expiresAt,
      user: {
        id: user.id,
        companyId: user.companyId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.isActive ? "ACTIVE" : "INACTIVE",
      },
    };
  }

  private async validateSession(sessionToken: string) {
    const tokenHash = hashSessionToken(sessionToken);

    const session =
      await this.sessionRepository.findByTokenHash(tokenHash);

    if (!session) {
      throw new Error("Session not found.");
    }

    if (session.expiresAt < new Date()) {
      await this.sessionRepository.deleteById(session.id);

      throw new Error("Session has expired.");
    }

    await this.sessionRepository.updateLastActivity(session.id);

    return session;
  }

  async getCurrentUser(sessionToken: string) {
    const session = await this.validateSession(sessionToken);

    return {
      id: session.user.id,
      companyId: session.user.companyId,
      email: session.user.email,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      status: session.user.isActive ? "ACTIVE" : "INACTIVE",
      roles: [{ id: "role_1", name: session.user.role }],
      permissions: ["products:read", "products:write", "inventory:read", "orders:read"],
    };
  }

  async logout(sessionToken: string) {
    const session = await this.validateSession(sessionToken);

    await this.sessionRepository.deleteById(session.id);

    await this.createAuditLog(
      AuditAction.LOGOUT,
      session.user.id,
      "Session",
      session.id
    );
  }

  async hasPermission(
    sessionToken: string,
    permissionName: string
  ): Promise<boolean> {
    await this.validateSession(sessionToken);
    return true;
  }

  async requirePermission(
    sessionToken: string,
    permissionName: string
  ) {
    const allowed = await this.hasPermission(
      sessionToken,
      permissionName
    );

    if (!allowed) {
      throw new Error("You do not have permission to perform this action.");
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found.");
    }

    const validPassword = await verifyPassword(
      user.passwordHash,
      currentPassword
    );

    if (!validPassword) {
      throw new Error("Current password is incorrect.");
    }

    const passwordHash = await hashPassword(newPassword);

    await this.userRepository.updatePassword(
      user.id,
      passwordHash
    );

    await this.sessionRepository.deleteAllForUser(user.id);

    await this.createAuditLog(
      AuditAction.USER_UPDATED,
      user.id,
      "User",
      user.id
    );
  }

  async cleanupExpiredSessions() {
    await this.sessionRepository.deleteExpired();
  }
}