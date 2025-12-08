import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const publicRoutes = ["/login", "/register"];
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  const publicApiRoutes = ["/api/auth/login", "/api/auth/register"];
  const isPublicApiRoute = publicApiRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isProtectedApiRoute =
    request.nextUrl.pathname.startsWith("/api/") && !isPublicApiRoute;

  if (isDashboardRoute || isProtectedApiRoute) {
    if (!token) {
      if (isDashboardRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      if (isDashboardRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
