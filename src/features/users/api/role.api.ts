export interface RoleItem {
    id: string;
    name: string;
  }
  
  export async function getRoles(): Promise<RoleItem[]> {
    const response = await fetch("/api/roles");
  
    if (!response.ok) {
      throw new Error("Failed to load roles.");
    }
  
    const result = await response.json();
  
    return result.data;
  }