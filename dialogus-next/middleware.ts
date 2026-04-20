import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/auth";

const PROTECTED_PATHS = ["/admin/generate"];
const PROTECTED_API_PATHS = [
  "/api/generate-blog",
  "/api/generate-image",
  "/api/publish-blog",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // --- 1. Handle Login Page Redirection ---
  if (pathname === "/admin/login") {
    if (sessionCookie) {
      const session = await verifySession(sessionCookie);
      if (session) {
        return NextResponse.redirect(new URL("/admin/generate", request.url));
      }
    }
    return NextResponse.next();
  }

  // --- 2. Handle Protected Paths Protection ---
  const isProtectedPage = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isProtectedApi = PROTECTED_API_PATHS.some((p) => pathname.startsWith(p));

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  if (!sessionCookie) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const session = await verifySession(sessionCookie);

  if (!session) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Add user info to headers for API routes/Server Components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", session.userId);
  requestHeaders.set("x-user-name", session.userName);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/admin/login",
    "/admin/generate/:path*",
    "/api/generate-blog",
    "/api/generate-image",
    "/api/publish-blog",
  ],
};
