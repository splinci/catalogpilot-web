import { RoleRepository } from "@/repositories/auth/role.repository";

export class RoleService {
  constructor(
    private readonly roleRepository = new RoleRepository()
  ) {}

  async getRoles() {
    return this.roleRepository.findAll();
  }
}