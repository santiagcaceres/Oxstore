"use client"

import { Package, Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface NoProductsFoundProps {
  title?: string
  description?: string
  showSearchButton?: boolean
  showHomeButton?: boolean
  onRetry?: () => void
}

export default function NoProductsFound({
  title = "No hay productos disponibles",
  description = "No se encontraron productos en esta categoría en este momento.",
  showSearchButton = true,
  showHomeButton = true,
  onRetry,
}: NoProductsFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
          <Search className="w-4 h-4 text-orange-500" />
        </div>
      </div>

      <h3 className="text-2xl font-semibold text-gray-900 mb-3">{title}</h3>

      <p className="text-gray-600 mb-8 max-w-md leading-relaxed">{description}</p>

      <div className="flex flex-col sm:flex-row gap-4">
        {showHomeButton && (
          <Link href="/">
            <Button className="bg-black hover:bg-gray-800 text-white px-6 py-2">Volver al Inicio</Button>
          </Link>
        )}

        {showSearchButton && (
          <Link href="/buscar">
            <Button variant="outline" className="border-gray-300 hover:bg-gray-50 px-6 py-2 bg-transparent">
              <Search className="w-4 h-4 mr-2" />
              Buscar Productos
            </Button>
          </Link>
        )}

        {onRetry && (
          <Button
            variant="outline"
            onClick={onRetry}
            className="border-gray-300 hover:bg-gray-50 px-6 py-2 bg-transparent"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Intentar de Nuevo
          </Button>
        )}
      </div>
    </div>
  )
}
