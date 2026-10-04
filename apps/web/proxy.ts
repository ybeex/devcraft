import { type NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED = ["/dashboard"];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ["/auth/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((p) =>
    pathname.startsWith(p)
  );

  const isAuthRoute = AUTH_ROUTES.some((p) =>
    pathname.startsWith(p)
  );

  // Presence check only — verification happens API-side
  const hasSession = request.cookies.has("refresh_token");

  if (isProtected && !hasSession) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("from", pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  const response = NextResponse.next();

  // Security headers
  response.headers.set(
    "X-Content-Type-Options",
    "nosniff"
  );

  response.headers.set(
    "X-Frame-Options",
    "SAMEORIGIN"
  );

  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );

  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|cv.pdf|og-image.png).*)",
  ],
};