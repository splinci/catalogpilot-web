import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { LoginRequestDto } from "@/types/auth";

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequestDto) =>
      apiClient("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}