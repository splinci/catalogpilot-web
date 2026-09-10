export interface CreateUserDto {
  companyId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: string;
}