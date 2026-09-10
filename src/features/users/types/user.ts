export interface UserListItem {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
  
    userRoles: {
      role: {
        id: string;
        name: string;
      };
    }[];
  }