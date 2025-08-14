import { Package, Home, Search, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header spacer */}
      <div className="h-20"></div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Página no encontrada</h2>

        <p className="text-gray-600 mb-8 max-w-md leading-relaxed text-lg">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link href="/">
            <Button className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-lg">
              <Home className="w-5 h-5 mr-2" />
              Volver al Inicio
            </Button>
          </Link>

          <Link href="/buscar">
            <Button variant="outline" className="border-gray-300 hover:bg-gray-50 px-8 py-3 text-lg bg-white">
              <Search className="w-5 h-5 mr-2" />
              Buscar Productos
            </Button>
          </Link>
        </div>

        <div className="text-sm text-gray-500">
          <p>¿Necesitas ayuda? Contacta con nuestro equipo de soporte</p>
        </div>
      </div>
    </div>
  )
}
