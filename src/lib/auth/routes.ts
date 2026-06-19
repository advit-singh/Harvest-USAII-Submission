export const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/reset-password",
] as const;

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
