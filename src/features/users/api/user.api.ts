import type { UpdateUserDto } from "@/types/auth";
import type { UserListItem } from "../types/user";

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
}

export async function getUsers(): Promise<UserListItem[]> {
  const response = await fetch("/api/users");

  if (!response.ok) {
    throw new Error("Failed to load users.");
  }

  const result = await response.json();

  return result.data;
}

export async function createUser(
  data: CreateUserRequest
) {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result.data;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: string;
  roleId?: string;
  password?: string;
}

export async function updateUser(
  id: string,
  data: UpdateUserRequest
): Promise<UserListItem> {
  const response = await fetch(`/api/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update user.");
  }

  const result = await response.json();

  return result.data;
}

export async function deleteUser(
  id: string
): Promise<void> {
  const response = await fetch(`/api/users/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete user.");
  }
}