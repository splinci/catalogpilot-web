import { NavigationSection } from "@/features/layout/types/navigation";

export function hasPermission(
  userPermissions: string[],
  requiredPermission?: string
): boolean {
  if (!requiredPermission) {
    return true;
  }

  return userPermissions.includes(requiredPermission);
}

export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission)
  );
}

export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission)
  );
}

export function filterNavigation(
  navigation: NavigationSection[],
  userPermissions: string[]
): NavigationSection[] {
  return navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        hasPermission(userPermissions, item.permission)
      ),
    }))
    .filter((section) => section.items.length > 0);
}