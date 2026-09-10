import { BaseRepository } from "../base/base.repository";
import { Role } from "@prisma/client";

export class RoleRepository extends BaseRepository {
  async findAll() {
    return Object.values(Role).map((r) => ({ id: r, name: r }));
  }
  
  async findById(id: string) {
    return { id, name: id };
  }

  async findByName(name: string) {
    return { id: name, name };
  }

  async getRolesForUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return [];
    return [{ role: { id: user.role, name: user.role } }];
  }

  async assignRole(userId: string, roleId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: roleId as Role },
    });
  }

  async removeRole(userId: string, roleId: string) {
    return { success: true };
  }
}