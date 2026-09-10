export interface LoginRequestDto {
    email: string;
    password: string;
  }
  
  export interface LoginResponseDto {
    success: boolean;
    userId: string;
  }

  export interface RegisterUserDto {
    companyId: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }