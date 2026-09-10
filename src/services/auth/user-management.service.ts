import { hashPassword } from "@/lib/auth/password";

import { UserStatus } from "@/generated/prisma/enums";

import { UserRepository } from "@/repositories/auth/user.repository";
import { RoleRepository } from "@/repositories/auth/role.repository";

import {
  CreateUserDto,
  UpdateUserDto,
} from "@/types/auth";

export class UserManagementService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly roleRepository = new RoleRepository()
  ) {}

  async getUsers() {
    return this.userRepository.findAll();
  }

  async getUsersByCompanyId(companyId: string) {
    return this.userRepository.findByCompanyId(companyId);
  }

  async getUser(id: string) {
    const user = await this.userRepository.findByIdWithRoles(id);

    if (!user) {
      throw new Error("User not found.");
    }

    return user;
  }

  async createUser(
    dto: Omit<CreateUserDto, "passwordHash">,
    roleId: string
  ) {
    const existingUser =
      await this.userRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new Error("Email already exists.");
    }

    const temporaryPassword = "ChangeMe@123";

    const passwordHash = await hashPassword(
      temporaryPassword
    );

    const user = await this.userRepository.create({
      ...dto,
      passwordHash,
    });

    await this.userRepository.assignRole(
      user.id,
      roleId
    );

    return {
      user,
      temporaryPassword,
    };
  }

  async updateUser(
    id: string,
    dto: UpdateUserDto & { password?: string; status?: string },
    roleId?: string
  ) {
    if (dto.password) {
      const passwordHash = await hashPassword(dto.password);
      await this.userRepository.updatePassword(id, passwordHash);
    }

    await this.userRepository.update(id, {
      ...dto,
      ...(dto.status && { isActive: dto.status === "ACTIVE" }),
    });

    if (roleId) {
      await this.userRepository.assignRole(
        id,
        roleId
      );
    }

    return this.userRepository.findByIdWithRoles(id);
  }

  async deleteUser(id: string) {
    return this.userRepository.delete(id);
  }

  async updateStatus(
    id: string,
    status: UserStatus | string
  ) {
    return this.userRepository.updateStatus(
      id,
      status
    );
  }

  async assignRole(
    userId: string,
    roleId: string
  ) {
    await this.userRepository.removeAllRoles(userId);

    await this.userRepository.assignRole(
      userId,
      roleId
    );
  }

  async resetPassword(
    userId: string,
    password: string
  ) {
    const passwordHash =
      await hashPassword(password);

    return this.userRepository.updatePassword(
      userId,
      passwordHash
    );
  }
}