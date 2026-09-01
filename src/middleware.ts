import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Se tentar acessar /usuarios e não for admin
    if (path.startsWith("/usuarios") && token?.cargo !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - login, forgot-password, reset-password (auth pages)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo-donavo.png, logo.jpeg, manifest.json, sw.js (public assets)
     */
    "/((?!api/auth|login|forgot-password|reset-password|_next/static|_next/image|favicon.ico|logo-donavo.png|logo.jpeg|manifest.json|sw.js).*)",
  ],
};
