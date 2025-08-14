"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header spacer */}
      <div className="h-20"></div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">¡Oops! Algo salió mal</h1>

        <p className="text-gray-600 mb-2 max-w-md leading-relaxed text-lg">
          Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
        </p>

        {error.message && (
          <p className="text-sm text-gray-500 mb-8 max-w-lg bg-gray-100 p-3 rounded-lg">Error: {error.message}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Button onClick={reset} className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-lg">
            <RefreshCw className="w-5 h-5 mr-2" />
            Intentar de Nuevo
          </Button>

          <Link href="/">
            <Button variant="outline" className="border-gray-300 hover:bg-gray-50 px-8 py-3 text-lg bg-white">
              <Home className="w-5 h-5 mr-2" />
              Volver al Inicio
            </Button>
          </Link>
        </div>

        <div className="text-sm text-gray-500">
          <p>Si el problema persiste, contacta con nuestro equipo de soporte</p>
        </div>
      </div>
    </div>
  )
}
