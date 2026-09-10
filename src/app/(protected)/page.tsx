import AppLayout from "@/components/layout/AppLayout";
import OperationalCommandCenterDashboard from "@/components/dashboard/OperationalCommandCenterDashboard";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { redirect } from "next/navigation";

export default async function ProtectedHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const permissions = (user.permissions as string[]) ?? [];
  const appUser = { ...user, permissions };

  return (
    <AppLayout user={appUser}>
      <OperationalCommandCenterDashboard />
    </AppLayout>
  );
}
