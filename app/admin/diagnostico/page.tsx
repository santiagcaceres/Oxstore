"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

interface DiagnosticTest {
  name: string
  status: "loading" | "success" | "error" | "warning"
  message: string
  details?: string
}

interface ZureoProduct {
  id: number
  codigo: string
  nombre: string
  marca: {
    id: number
    nombre: string | null
  }
  stock: number
  precio: number
}

export default function DiagnosticoPage() {
  const [tests, setTests] = useState<DiagnosticTest[]>([
    { name: "Variables de Entorno", status: "loading", message: "Verificando..." },
    { name: "Autenticación Zureo", status: "loading", message: "Verificando..." },
    { name: "Conexión API Zureo", status: "loading", message: "Verificando..." },
    { name: "Productos Zureo", status: "loading", message: "Verificando..." },
    { name: "Productos con Marca", status: "loading", message: "Verificando..." },
  ])

  const [brandedProducts, setBrandedProducts] = useState<ZureoProduct[]>([])
  const [showBrandedProducts, setShowBrandedProducts] = useState(false)

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    // Test 1: Environment Variables
    try {
      const envResponse = await fetch("/api/test-env-vars")
      const envData = await envResponse.json()
      updateTest(0, envData.success ? "success" : "error", envData.message, envData.details)
    } catch (error) {
      updateTest(0, "error", "Error al verificar variables de entorno")
    }

    // Test 2: Zureo Authentication
    try {
      const authResponse = await fetch("/api/test-zureo-auth")
      const authData = await authResponse.json()
      updateTest(1, authData.success ? "success" : "error", authData.message, authData.details)
    } catch (error) {
      updateTest(1, "error", "Error al verificar autenticación")
    }

    // Test 3: Zureo API Connection
    try {
      const apiResponse = await fetch("/api/test-zureo-companies")
      const apiData = await apiResponse.json()
      updateTest(2, apiData.success ? "success" : "error", apiData.message, apiData.details)
    } catch (error) {
      updateTest(2, "error", "Error al conectar con API Zureo")
    }

    // Test 4: Zureo Products
    try {
      const productsResponse = await fetch("/api/test-zureo-products")
      const productsData = await productsResponse.json()
      updateTest(3, productsData.success ? "success" : "error", productsData.message, productsData.details)
    } catch (error) {
      updateTest(3, "error", "Error al obtener productos")
    }

    // Test 5: Branded Products
    try {
      const brandedResponse = await fetch("/api/test-zureo-branded-products")
      const brandedData = await brandedResponse.json()

      if (brandedData.success) {
        setBrandedProducts(brandedData.products || [])
        const count = brandedData.products?.length || 0
        updateTest(
          4,
          count > 0 ? "success" : "warning",
          count > 0 ? `${count} productos con marca encontrados` : "No se encontraron productos con marca",
          `Total de productos con marca asignada: ${count}`,
        )
      } else {
        updateTest(4, "error", brandedData.message)
      }
    } catch (error) {
      updateTest(4, "error", "Error al obtener productos con marca")
    }
  }

  const updateTest = (index: number, status: DiagnosticTest["status"], message: string, details?: string) => {
    setTests((prev) => prev.map((test, i) => (i === index ? { ...test, status, message, details } : test)))
  }

  const getStatusIcon = (status: DiagnosticTest["status"]) => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: DiagnosticTest["status"]) => {
    switch (status) {
      case "loading":
        return "bg-gray-100 text-gray-800"
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Diagnóstico del Sistema</h1>
        <p className="text-gray-600 mt-2">Verificación del estado de la integración con Zureo</p>
      </div>

      <div className="flex gap-4">
        <Button onClick={runDiagnostics} className="bg-black hover:bg-gray-800">
          Ejecutar Diagnóstico
        </Button>
        {brandedProducts.length > 0 && (
          <Button variant="outline" onClick={() => setShowBrandedProducts(!showBrandedProducts)}>
            {showBrandedProducts ? "Ocultar" : "Ver"} Productos con Marca
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
                <Badge className={getStatusColor(test.status)}>
                  {test.status === "loading" ? "Verificando" : test.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{test.message}</p>
              {test.details && <p className="text-sm text-gray-500 mt-2">{test.details}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Productos con Marca */}
      {showBrandedProducts && brandedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos con Marca Asignada</CardTitle>
            <CardDescription>Lista de productos que tienen una marca asignada en Zureo</CardDescription>
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
                    <Badge variant="outline">{product.marca.nombre}</Badge>
                    <p className="text-sm text-gray-500 mt-1">
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
