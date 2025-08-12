"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Loader2, Play, Database } from "lucide-react"

interface ApiResult {
  endpoint: string
  status: "idle" | "loading" | "success" | "error"
  data?: any
  error?: string
  timestamp?: string
}

export default function ZureoApiPanel() {
  const [results, setResults] = useState<Record<string, ApiResult>>({})

  const executeEndpoint = async (endpoint: string, params: any = {}) => {
    const key = `${endpoint}-${JSON.stringify(params)}`

    setResults((prev) => ({
      ...prev,
      [key]: { endpoint, status: "loading" },
    }))

    try {
      let url = `/api/zureo${endpoint}`

      if (endpoint === "/products-with-stock") {
        url = `/api/zureo/products`
      }

      const queryString = new URLSearchParams(params).toString()
      if (queryString) {
        url += `?${queryString}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      let filteredData = data
      if (endpoint === "/products-with-stock" && data.success && Array.isArray(data.data)) {
        filteredData = {
          ...data,
          data: data.data.filter((product: any) => product.stock > 0),
          message: `Productos filtrados con stock > 0: ${data.data.filter((product: any) => product.stock > 0).length} de ${data.data.length} productos`,
        }
      }

      setResults((prev) => ({
        ...prev,
        [key]: {
          endpoint,
          status: "success",
          data: filteredData,
          timestamp: new Date().toLocaleTimeString(),
        },
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [key]: {
          endpoint,
          status: "error",
          error: error instanceof Error ? error.message : "Error desconocido",
          timestamp: new Date().toLocaleTimeString(),
        },
      }))
    }
  }

  const endpoints = [
    {
      category: "🔐 Autenticación",
      items: [
        {
          name: "Test Token",
          endpoint: "/test-token",
          description: "Verificar token de autenticación",
          critical: true,
        },
      ],
    },
    {
      category: "📦 Productos",
      items: [
        { name: "Todos los Productos", endpoint: "/products", description: "Obtener todos los productos" },
        {
          name: "Productos Activos",
          endpoint: "/products",
          params: { includeInactive: false },
          description: "Solo productos activos",
        },
        {
          name: "Productos con Stock",
          endpoint: "/products-with-stock",
          description: "Productos con stock > 0 (filtrado local)",
        },
        {
          name: "Buscar Productos",
          endpoint: "/products/search",
          params: { q: "remera" },
          description: "Buscar productos por término",
        },
        { name: "Producto por ID", endpoint: "/products/1", description: "Obtener producto específico" },
        { name: "Imágenes de Producto", endpoint: "/products/1/images", description: "Imágenes de un producto" },
      ],
    },
    {
      category: "🏷️ Marcas",
      items: [
        {
          name: "Todas las Marcas",
          endpoint: "/brands",
          description: "Obtener todas las marcas",
          critical: true,
        },
      ],
    },
    {
      category: "🏢 Empresas",
      items: [
        { name: "Todas las Empresas", endpoint: "/companies", description: "Obtener todas las empresas" },
        { name: "Empresa por ID", endpoint: "/companies/1", description: "Obtener empresa específica" },
      ],
    },
    {
      category: "📋 Tipos de Producto",
      items: [{ name: "Tipos de Producto", endpoint: "/product-types", description: "Obtener tipos de producto" }],
    },
    {
      category: "💰 Precios",
      items: [{ name: "Lista de Precios", endpoint: "/prices", description: "Obtener lista de precios" }],
    },
    {
      category: "💳 Pagos y Envíos",
      items: [
        { name: "Métodos de Pago", endpoint: "/payment-methods", description: "Métodos de pago disponibles" },
        { name: "Métodos de Envío", endpoint: "/shipping-methods", description: "Métodos de envío disponibles" },
        { name: "Localidades", endpoint: "/localities", description: "Localidades para envío" },
      ],
    },
    {
      category: "📊 Stock",
      items: [
        {
          name: "Stock por Sucursal",
          endpoint: "/stock",
          params: { emp: 1, suc: 1 },
          description: "Stock por sucursal",
        },
      ],
    },
  ]

  const ResultCard = ({ result, resultKey }: { result: ApiResult; resultKey: string }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono">{result.endpoint}</CardTitle>
          <div className="flex items-center gap-2">
            {result.status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
            {result.status === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
            {result.status === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
            <Badge
              variant={
                result.status === "success" ? "default" : result.status === "error" ? "destructive" : "secondary"
              }
            >
              {result.status}
            </Badge>
            {result.timestamp && <span className="text-xs text-muted-foreground">{result.timestamp}</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {result.error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
            <p className="text-red-700 text-sm font-medium">Error:</p>
            <p className="text-red-600 text-sm">{result.error}</p>
          </div>
        )}
        {result.data && (
          <div className="bg-gray-50 rounded p-3">
            <pre className="text-xs overflow-auto max-h-96">{JSON.stringify(result.data, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="h-8 w-8" />
          Panel de API Zureo
        </h1>
        <p className="text-muted-foreground">
          Prueba todos los endpoints de la API de Zureo y verifica errores específicos
        </p>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Credenciales Configuradas:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Usuario:</strong> patricia_saura@hotmail.com
            </div>
            <div>
              <strong>Dominio:</strong> 020128150011
            </div>
            <div>
              <strong>Company ID:</strong> 1
            </div>
            <div>
              <strong>Contraseña:</strong> ••••••
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {endpoints.map((category) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle>{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {category.items.map((item) => {
                  const resultKey = `${item.endpoint}-${JSON.stringify((item as any).params || {})}`
                  const result = results[resultKey]

                  return (
                    <div key={item.name} className="space-y-3">
                      <div
                        className={`flex items-center justify-between p-3 border rounded ${(item as any).critical ? "border-orange-300 bg-orange-50" : ""}`}
                      >
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {item.name}
                            {(item as any).critical && (
                              <Badge variant="outline" className="text-orange-600 border-orange-300">
                                Crítico
                              </Badge>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{item.endpoint}</code>
                        </div>
                        <Button
                          onClick={() => executeEndpoint(item.endpoint, (item as any).params)}
                          size="sm"
                          disabled={result?.status === "loading"}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Ejecutar
                        </Button>
                      </div>

                      {result && <ResultCard result={result} resultKey={resultKey} />}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
