import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "importeasy-angola-dev-secret-change-in-production-secure-key";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Proteção de rotas do Backoffice Admin
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const sessionCookie = request.cookies.get("importeasy_session")?.value;

    let isValidAdmin = false;
    if (sessionCookie) {
      try {
        const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
        if (payload && payload.role === "admin") {
          isValidAdmin = true;
        }
      } catch {
        isValidAdmin = false;
      }
    }

    // Se estiver na tela de login mas já for admin autenticado, vai direto para o painel
    if (isLoginPage && isValidAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Se tentar aceder a qualquer página do painel sem autenticação, redireciona para login com HTTP 307
    if (!isLoginPage && !isValidAdmin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // 2. Cabeçalhos de Segurança
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
