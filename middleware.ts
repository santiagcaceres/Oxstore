import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const supabaseProtectedPaths = ["/perfil"]
  const isSupabaseProtectedPath = supabaseProtectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isSupabaseProtectedPath) {
    return await updateSession(request)
  }

  // Para todas las demás rutas, continuar sin procesamiento de Supabase
  return
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
