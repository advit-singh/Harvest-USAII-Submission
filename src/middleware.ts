import { NextResponse, type NextRequest } from "next/server";
import { isPublicRoute } from "@/lib/auth/routes";
import { updateSession } from "@/lib/supabase/middleware";

function hasDevAuth(request: NextRequest): boolean {
  return request.cookies.get("harvest-dev-auth")?.value === "1";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);

  let isAuthenticated = false;

  if (supabaseConfigured) {
    const response = await updateSession(request);
    const supabase = await import("@supabase/ssr").then((m) =>
      m.createServerClient(supabaseUrl!, supabaseKey!, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      }),
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = Boolean(user);

    if (isPublicRoute(pathname) && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!isPublicRoute(pathname) && pathname !== "/onboarding" && !isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  }

  isAuthenticated = hasDevAuth(request);

  if (isPublicRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    !isPublicRoute(pathname) &&
    pathname !== "/onboarding" &&
    !isAuthenticated
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
