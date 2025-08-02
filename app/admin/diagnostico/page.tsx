"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader, RefreshCw, AlertTriangle } from "lucide-react"

interface DiagnosticResult {
  test: string
  status: "success" | "error" | "loading"
  message: string
  details?: any
}

export default function DiagnosticoPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostic = async () => {
    setIsRunning(true)
    setResults([])

    const tests = [
      { name: "Variables de Entorno", endpoint: "/api/test-env-vars" },
      { name: "Autenticación con Zureo", endpoint: "/api/test-zureo-auth" },
      { name: "Obtener Empresas", endpoint: "/api/test-zureo-companies" },
      { name: "Obtener Productos", endpoint: "/api/test-zureo-products" },
    ]

    for (const test of tests) {
      setResults((prev) => [...prev, { test: test.name, status: "loading", message: "Ejecutando..." }])

      try {
        const response = await fetch(test.endpoint)
        const data = await response.json()

        setResults((prev) =>
          prev.map((result) =>
            result.test === test.name
              ? {
                  test: test.name,
                  status: data.success ? "success" : "error",
                  message: data.message || (data.success ? "Exitoso" : "Error"),
                  details: data.details,
                }
              : result,
          ),
        )
      } catch (error) {
        setResults((prev) =>
          prev.map((result) =>
            result.test === test.name
              ? {
                  test: test.name,
                  status: "error",
                  message: `Error de conexión: ${error}`,
                }
              : result,
          ),
        )
      }

      // Pequeña pausa entre tests para mejor UX
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "loading":
        return <Loader className="h-5 w-5 text-blue-600 animate-spin" />
    }
  }

  const getStatusBadge = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">✅ Exitoso</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">❌ Error</Badge>
      case "loading":
        return <Badge className="bg-blue-100 text-blue-800">⏳ Ejecutando</Badge>
    }
  }

  const hasAuthError = results.some((r) => r.status === "error" && r.details?.status === 401)

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Diagnóstico de Conexión con Zureo</h1>
            <p className="text-gray-600">
              Verifica que la conexión con la API de Zureo esté funcionando correctamente.
            </p>
          </div>

          {hasAuthError && (
            <Card className="mb-6 bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Error 401 - Problema de Autenticación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-yellow-700">
                  El error 401 indica que las credenciales no son válidas o que tu cuenta no tiene permisos de API
                  habilitados.
                </p>
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-semibold mb-2">Posibles causas:</h4>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>
                      <strong>Credenciales incorrectas:</strong> Usuario, contraseña o dominio mal configurados
                    </li>
                    <li>
                      <strong>Cuenta sin permisos de API:</strong> Tu cuenta de Zureo puede no tener habilitado el
                      acceso a la API
                    </li>
                    <li>
                      <strong>Cuenta no activada:</strong> Zureo puede no haber activado tu acceso al sistema de
                      desarrollo
                    </li>
                    <li>
                      <strong>Formato incorrecto:</strong> El formato debe ser exactamente usuario:contraseña:dominio
                    </li>
                  </ul>

                  <h4 className="font-semibold mb-2 mt-4">Qué hacer:</h4>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Contacta a Santiago de Zureo para confirmar que tu cuenta tiene acceso a la API</li>
                    <li>Verifica que las credenciales sean exactamente las correctas</li>
                    <li>Solicita que activen tu acceso al entorno de desarrollo si es necesario</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Ejecutar Diagnóstico</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={runDiagnostic} disabled={isRunning} className="bg-blue-950 hover:bg-blue-900" size="lg">
                {isRunning ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Ejecutando Diagnóstico...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Ejecutar Diagnóstico
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resultados del Diagnóstico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          <h3 className="font-semibold">{result.test}</h3>
                        </div>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                      {result.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                            Ver detalles técnicos
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {results.length > 0 && !isRunning && !hasAuthError && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">¿Qué significan estos resultados?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  <strong>✅ Variables de Entorno:</strong> Las credenciales de Zureo están configuradas en Vercel.
                </li>
                <li>
                  <strong>✅ Autenticación:</strong> Podemos conectarnos exitosamente a la API de Zureo.
                </li>
                <li>
                  <strong>✅ Empresas:</strong> Podemos obtener la lista de empresas disponibles.
                </li>
                <li>
                  <strong>✅ Productos:</strong> Podemos obtener el catálogo de productos desde Zureo.
                </li>
              </ul>
              <p className="text-sm text-blue-800 mt-3">
                Si todos los tests muestran ✅, ¡tu e-commerce está listo para conectarse con Zureo!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
