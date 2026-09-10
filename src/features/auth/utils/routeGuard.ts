import { routePermissions } from "../config/routePermissions";

export function getRequiredPermission(
  pathname: string
): string | undefined {
  if (routePermissions[pathname]) {
    return routePermissions[pathname];
  }

  const matchedRoute = Object.keys(routePermissions).find((route) =>
    pathname.startsWith(route)
  );

  if (!matchedRoute) {
    return undefined;
  }

  return routePermissions[matchedRoute];
}