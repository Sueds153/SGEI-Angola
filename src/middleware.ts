import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "importeasy-angola-dev-secret-change-in-production-secure-key";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protege todas as rotas /admin exceto /admin/login
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

    // Se tentar acessar o painel sem ser admin autenticado, redireciona para login com HTTP 307 direto
    if (!isLoginPage && !isValidAdmin) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
