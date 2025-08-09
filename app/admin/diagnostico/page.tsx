"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

type TestResult = {
  name: string
  status: "success" | "error" | "warning" | "loading"
  message: string
  data?: any
}

export default function DiagnosticoPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [brandedProducts, setBrandedProducts] = useState<any[]>([])

  const tests = [
    { name: "Variables de Entorno", endpoint: "/api/test-env-vars" },
    { name: "Autenticación Zureo", endpoint: "/api/test-zureo-auth" },
    { name: "Empresas Zureo", endpoint: "/api/test-zureo-companies" },
    { name: "Productos Zureo", endpoint: "/api/test-zureo-products" },
    { name: "Productos con Marca", endpoint: "/api/test-zureo-branded-products" },
    { name: "Test Completo", endpoint: "/api/test-zureo-full" },
  ]

  const runTest = async (test: { name: string; endpoint: string }) => {
    setResults((prev) =>
      prev.map((r) => (r.name === test.name ? { ...r, status: "loading" as const, message: "Ejecutando..." } : r)),
    )

    try {
      const response = await fetch(test.endpoint)
      const data = await response.json()

      if (test.name === "Productos con Marca" && data.success) {
        setBrandedProducts(data.data || [])
      }

      setResults((prev) =>
        prev.map((r) =>
          r.name === test.name
            ? {
                ...r,
                status: data.success ? ("success" as const) : ("error" as const),
                message: data.message || (data.success ? "✓ Exitoso" : "✗ Error"),
                data: data.data,
              }
            : r,
        ),
      )
    } catch (error) {
      setResults((prev) =>
        prev.map((r) =>
          r.name === test.name
            ? {
                ...r,
                status: "error" as const,
                message: `Error: ${error instanceof Error ? error.message : "Error desconocido"}`,
              }
            : r,
        ),
      )
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setResults(
      tests.map((test) => ({
        name: test.name,
        status: "loading" as const,
        message: "Esperando...",
      })),
    )

    for (const test of tests) {
      await runTest(test)
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "loading":
        return <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Exitoso</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Advertencia</Badge>
      case "loading":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Cargando</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Diagnóstico del Sistema</h1>
        <p className="text-gray-600 mt-2">Verifica el estado de las conexiones y configuraciones del sistema.</p>
      </div>

      <div className="flex gap-4">
        <Button onClick={runAllTests} disabled={isRunning} className="bg-black hover:bg-gray-800">
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ejecutando Tests...
            </>
          ) : (
            "Ejecutar Todos los Tests"
          )}
        </Button>
      </div>

      <div className="grid gap-4">
        {results.map((result) => (
          <Card key={result.name}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <CardTitle className="text-lg">{result.name}</CardTitle>
                </div>
                {getStatusBadge(result.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{result.message}</p>
              {result.data && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <pre className="text-xs text-gray-700 overflow-x-auto">{JSON.stringify(result.data, null, 2)}</pre>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => runTest(tests.find((t) => t.name === result.name)!)}
                disabled={result.status === "loading"}
                className="mt-3"
              >
                Ejecutar Test Individual
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Productos con Marca */}
      {brandedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos con Marca Asignada</CardTitle>
            <CardDescription>{brandedProducts.length} productos tienen marca asignada</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {brandedProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{product.nombre}</h4>
                    <p className="text-sm text-gray-600">Código: {product.codigo}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-black text-white">{product.marca.nombre}</Badge>
                    <p className="text-sm text-gray-500 mt-1">${product.precio?.toFixed(2) || "0.00"}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
