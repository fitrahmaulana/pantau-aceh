import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if the path starts with /admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Exception for the login page itself
    if (request.nextUrl.pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Check for the admin_session cookie
    const adminSession = request.cookies.get("admin_session");

    if (!adminSession || adminSession.value !== "true") {
      // Redirect to login page if not authenticated
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
