import { LoginCard } from "@/components/auth/LoginCard";
import { ActivateCard } from "@/components/auth/ActivateCard";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<{ mode?: string; token?: string; userId?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const isActivateMode = params.mode === "activate" || Boolean(params.token) || Boolean(params.userId);

  if (isActivateMode) {
    return <ActivateCard />;
  }

  return <LoginCard />;
}
