import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Vamos adicionar logs ao middleware para verificar se está bloqueando o acesso à página de fotos

export function middleware(request: NextRequest) {
  console.log("Middleware executado para:", request.nextUrl.pathname)

  // Verificar se estamos na página de login ou admin
  if (request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/admin") {
    console.log("Página de login ou admin, permitindo acesso")
    return NextResponse.next()
  }

  // Verificar se o usuário está autenticado
  const operatorCookie = request.cookies.get("operator")
  console.log("Cookie do operador:", operatorCookie ? "Presente" : "Ausente")

  if (!operatorCookie) {
    // Redirecionar para a página de login se não estiver autenticado
    console.log("Redirecionando para login por falta de autenticação")
    return NextResponse.redirect(new URL("/", request.url))
  }

  console.log("Acesso permitido")
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

