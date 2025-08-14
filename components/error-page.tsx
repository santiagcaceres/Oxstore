"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ErrorPageProps {
  title?: string
  description?: string
  showRetryButton?: boolean
  showHomeButton?: boolean
  onRetry?: () => void
}

export default function ErrorPage({
  title = "Error al cargar la página",
  description = "No pudimos cargar el contenido solicitado. Por favor, intenta nuevamente.",
  showRetryButton = true,
  showHomeButton = true,
  onRetry,
}: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto text-center px-4">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-gray-600 mb-8">{description}</p>
        </div>

        <div className="space-y-4">
          {showRetryButton && (
            <Button
              onClick={onRetry || (() => window.location.reload())}
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              Reintentar
            </Button>
          )}

          {showHomeButton && (
            <Link href="/" className="block">
              <Button variant="outline" className="w-full bg-transparent">
                Volver al Inicio
              </Button>
            </Link>
          )}
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Si el problema persiste, contacta con nuestro equipo de soporte.</p>
        </div>
      </div>
    </div>
  )
}
