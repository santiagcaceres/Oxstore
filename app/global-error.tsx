"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
              <AlertTriangle className="w-16 h-16 text-red-500" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">Error Crítico</h1>

          <p className="text-gray-600 mb-8 max-w-md leading-relaxed text-lg">
            Ha ocurrido un error crítico en la aplicación. Por favor, recarga la página.
          </p>

          <Button onClick={reset} className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-lg">
            <RefreshCw className="w-5 h-5 mr-2" />
            Recargar Página
          </Button>
        </div>
      </body>
    </html>
  )
}
