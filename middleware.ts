import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Si es un favicon o icono, forzar no-cache
  if (
    request.nextUrl.pathname.includes("icon") ||
    request.nextUrl.pathname.includes("favicon") ||
    request.nextUrl.pathname.includes("apple") ||
    request.nextUrl.pathname.endsWith(".ico") ||
    (request.nextUrl.pathname.endsWith(".png") && request.nextUrl.pathname.includes("app-icon"))
  ) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    response.headers.set("Surrogate-Control", "no-store")
  }

  return response
}

export const config = {
  matcher: [
    "/icon.png",
    "/app-icon.png",
    "/favicon.ico",
    "/apple-icon",
    "/icon",
    "/((?!api|_next/static|_next/image).*)",
  ],
}
