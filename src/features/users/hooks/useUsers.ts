"use client";

import { useCallback, useEffect, useState } from "react";

import { UserListItem } from "../types/user";
import { getUsers } from "../api/user.api";

export function useUsers() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getUsers();

      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    loading,
    refresh: loadUsers,
  };
}