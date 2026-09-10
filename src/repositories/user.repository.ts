import { prisma } from '@/lib/prisma';
import { User, Company, Role } from '@prisma/client';

export interface UserWithCompany extends User {
  company: Company;
}

export class UserRepository {
  async findByEmail(email: string): Promise<UserWithCompany | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { company: true },
    }) as Promise<UserWithCompany | null>;
  }

  async findById(id: string): Promise<UserWithCompany | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { company: true },
    }) as Promise<UserWithCompany | null>;
  }

  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  }

  async createUser(data: {
    companyId: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: Role;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        companyId: data.companyId,
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        isActive: true,
      },
    });
  }
}

export const userRepository = new UserRepository();
