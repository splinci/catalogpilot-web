import { BaseRepository } from "../base/base.repository";
import { authorizationService } from "@/services/authorization.service";

export class PermissionRepository extends BaseRepository {
  async getPermissionsForRole(role: string) {
    return ["products:read", "products:write", "inventory:read"];
  }

  async getPermissionsForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return [];
    return ["products:read", "products:write", "inventory:read"];
  }

  async hasPermission(userId: string, permission: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return false;
    return authorizationService.hasPermission(user.role, permission as any);
  }
}