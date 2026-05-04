import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const publicPaths = ["/", "/login", "/register"];
const publicApiPaths = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/health",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Skip public pages & APIs
  if (
    publicPaths.includes(pathname) ||
    publicApiPaths.includes(pathname)
  ) {
    return NextResponse.next();
  }

  // ✅ Skip all Next.js internals & static assets (extra safety)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("taskflow-token")?.value;

  // ❌ No token
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    await jwtVerify(token, secret);

    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("taskflow-token");
    return response;
  }
}

export const config = {
  matcher: [
    // ✅ EXCLUDE health + static + images
    "/((?!api/health|_next/static|_next/image|favicon.ico).*)",
  ],
};