"use client";

import { useCallback, useEffect, useState } from "react";

import { getRoles, RoleItem } from "../api/role.api";

export function useRoles() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getRoles();

      setRoles(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  return {
    roles,
    loading,
    refresh: loadRoles,
  };
}