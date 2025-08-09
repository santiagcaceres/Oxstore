"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react"

interface DiagnosticTest {
  name: string
  status: "idle" | "loading" | "success" | "error" | "warning"
  message: string
  details?: any
}

interface BrandedProduct {
  id: number
  codigo: string
  nombre: string
  marca: {
    id: number
    nombre: string
  }
  stock: number
  precio: number
}

export default function DiagnosticoPage() {
  const [tests, setTests] = useState<DiagnosticTest[]>([
    { name: "Variables de Entorno", status: "idle", message: "No ejecutado" },
    { name: "Autenticación Zureo", status: "idle", message: "No ejecutado" },
    { name: "Conexión API Zureo", status: "idle", message: "No ejecutado" },
    { name: "Productos Zureo", status: "idle", message: "No ejecutado" },
    { name: "Productos con Marca", status: "idle", message: "No ejecutado" },
  ])

  const [brandedProducts, setBrandedProducts] = useState<BrandedProduct[]>([])
  const [showBrandedProducts, setShowBrandedProducts] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  const updateTest = (index: number, status: DiagnosticTest["status"], message: string, details?: any) => {
    setTests((prev) => prev.map((test, i) => (i === index ? { ...test, status, message, details } : test)))
  }

  const runSingleTest = async (index: number) => {
    const testEndpoints = [
      "/api/test-env-vars",
      "/api/test-zureo-auth",
      "/api/test-zureo-companies",
      "/api/test-zureo-products",
      "/api/test-zureo-branded-products",
    ]

    updateTest(index, "loading", "Ejecutando...")

    try {
      const response = await fetch(testEndpoints[index])
      const data = await response.json()

      if (data.success) {
        updateTest(index, "success", data.message, data.details || data.data)

        // If it's the branded products test, save the products
        if (index === 4 && data.products) {
          setBrandedProducts(data.products)
        }
      } else {
        updateTest(index, "error", data.message || "Error desconocido", data.details)
      }
    } catch (error) {
      updateTest(index, "error", `Error de conexión: ${error instanceof Error ? error.message : "Error desconocido"}`)
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setBrandedProducts([])

    for (let i = 0; i < tests.length; i++) {
      await runSingleTest(i)
      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: DiagnosticTest["status"]) => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300" />
    }
  }

  const getStatusColor = (status: DiagnosticTest["status"]) => {
    switch (status) {
      case "loading":
        return "bg-blue-100 text-blue-800"
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Diagnóstico del Sistema</h1>
        <p className="text-gray-600 mt-2">Verificación del estado de la integración con Zureo</p>
      </div>

      <div className="flex gap-4">
        <Button onClick={runAllTests} disabled={isRunning} className="bg-black hover:bg-gray-800">
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ejecutando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Ejecutar Todos los Tests
            </>
          )}
        </Button>

        {brandedProducts.length > 0 && (
          <Button variant="outline" onClick={() => setShowBrandedProducts(!showBrandedProducts)}>
            {showBrandedProducts ? "Ocultar" : "Ver"} Productos con Marca ({brandedProducts.length})
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {tests.map((test, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getStatusIcon(test.status)}
                  {test.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(test.status)}>
                    {test.status === "idle" ? "Pendiente" : test.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runSingleTest(index)}
                    disabled={test.status === "loading"}
                  >
                    Ejecutar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{test.message}</p>
              {test.details && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Ver detalles técnicos
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                    {JSON.stringify(test.details, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Productos con Marca */}
      {showBrandedProducts && brandedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos con Marca Asignada</CardTitle>
            <CardDescription>
              Lista de productos que tienen una marca asignada en Zureo ({brandedProducts.length} productos)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {brandedProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{product.nombre}</h4>
                    <p className="text-sm text-gray-500">Código: {product.codigo}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      {product.marca.nombre}
                    </Badge>
                    <p className="text-sm text-gray-500">
                      Stock: {product.stock} | ${product.precio.toFixed(2)}
                    </p>
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
