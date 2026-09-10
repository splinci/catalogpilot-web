import { Role } from "@prisma/client";
import { BaseRepository } from "../base/base.repository";
import { CreateUserDto, UpdateUserDto } from "@/types/auth";

export class UserRepository extends BaseRepository {
  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByCompanyId(companyId: string) {
    return this.prisma.user.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByIdWithRoles(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async create(data: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        companyId: "cmp_atlas_01",
        email: data.email.toLowerCase(),
        passwordHash: (data as any).passwordHash || "",
        firstName: (data as any).firstName || "User",
        lastName: (data as any).lastName || "Name",
        role: (data as any).role || Role.SALES_REPRESENTATIVE,
        isActive: true,
      },
    });
  }

  async update(id: string, data: Partial<UpdateUserDto> & { firstName?: string; lastName?: string; email?: string; role?: Role; isActive?: boolean }) {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.email && { email: data.email.toLowerCase() }),
        ...(data.role && { role: data.role }),
        ...(typeof data.isActive === "boolean" && { isActive: data.isActive }),
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async updateLastLogin(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        updatedAt: new Date(),
      },
    });
  }

  async updatePassword(id: string, passwordHash: string) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        passwordHash,
      },
    });
  }

  async removeAllRoles(userId: string) {
    return { count: 0 };
  }

  async assignRole(userId: string, roleId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        role: roleId as Role,
      },
    });
  }

  async updateStatus(id: string, status: any) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        isActive: status === "ACTIVE",
      },
    });
  }
}