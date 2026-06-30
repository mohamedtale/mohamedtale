import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "wells-system-secret-2024";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/api")
  ) {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("auth_token");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
