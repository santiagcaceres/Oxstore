"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Loader2, Play } from "lucide-react"

interface ApiResult {
  endpoint: string
  status: "idle" | "loading" | "success" | "error"
  data?: any
  error?: string
  timestamp?: string
}

export default function ZureoApiPanel() {
  const [results, setResults] = useState<Record<string, ApiResult>>({})
  const [customEndpoint, setCustomEndpoint] = useState("")
  const [customParams, setCustomParams] = useState("")

  const executeEndpoint = async (endpoint: string, params: any = {}) => {
    const key = `${endpoint}-${JSON.stringify(params)}`

    setResults((prev) => ({
      ...prev,
      [key]: { endpoint, status: "loading" },
    }))

    try {
      const queryString = new URLSearchParams(params).toString()
      const url = `/api/zureo${endpoint}${queryString ? `?${queryString}` : ""}`

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      setResults((prev) => ({
        ...prev,
        [key]: {
          endpoint,
          status: "success",
          data,
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

  const executeCustomEndpoint = async () => {
    if (!customEndpoint) return

    let params = {}
    try {
      if (customParams.trim()) {
        params = JSON.parse(customParams)
      }
    } catch (e) {
      alert("Parámetros JSON inválidos")
      return
    }

    await executeEndpoint(customEndpoint, params)
  }

  const endpoints = [
    {
      category: "Autenticación",
      items: [{ name: "Test Token", endpoint: "/test-token", description: "Verificar token de autenticación" }],
    },
    {
      category: "Productos",
      items: [
        { name: "Todos los Productos", endpoint: "/products", description: "Obtener todos los productos" },
        {
          name: "Productos Activos",
          endpoint: "/products",
          params: { includeInactive: false },
          description: "Solo productos activos",
        },
        { name: "Productos con Stock", endpoint: "/products-with-stock", description: "Productos con stock > 0" },
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
      category: "Marcas",
      items: [{ name: "Todas las Marcas", endpoint: "/brands", description: "Obtener todas las marcas" }],
    },
    {
      category: "Empresas",
      items: [
        { name: "Todas las Empresas", endpoint: "/companies", description: "Obtener todas las empresas" },
        { name: "Empresa por ID", endpoint: "/companies/1", description: "Obtener empresa específica" },
      ],
    },
    {
      category: "Tipos de Producto",
      items: [{ name: "Tipos de Producto", endpoint: "/product-types", description: "Obtener tipos de producto" }],
    },
    {
      category: "Precios",
      items: [{ name: "Lista de Precios", endpoint: "/prices", description: "Obtener lista de precios" }],
    },
    {
      category: "Pagos y Envíos",
      items: [
        { name: "Métodos de Pago", endpoint: "/payment-methods", description: "Métodos de pago disponibles" },
        { name: "Métodos de Envío", endpoint: "/shipping-methods", description: "Métodos de envío disponibles" },
        { name: "Localidades", endpoint: "/localities", description: "Localidades para envío" },
      ],
    },
    {
      category: "Stock",
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
        <h1 className="text-3xl font-bold">Panel de API Zureo</h1>
        <p className="text-muted-foreground">Prueba todos los endpoints de la API de Zureo</p>
      </div>

      <Tabs defaultValue="endpoints" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="custom">Endpoint Personalizado</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-6">
          {endpoints.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle>{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {category.items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{item.endpoint}</code>
                      </div>
                      <Button
                        onClick={() => executeEndpoint(item.endpoint, item.params)}
                        size="sm"
                        disabled={
                          results[`${item.endpoint}-${JSON.stringify(item.params || {})}`]?.status === "loading"
                        }
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Ejecutar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Personalizado</CardTitle>
              <CardDescription>Ejecuta cualquier endpoint de la API de Zureo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="endpoint">Endpoint</Label>
                <Input
                  id="endpoint"
                  placeholder="/sdk/v1/product/all"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="params">Parámetros (JSON)</Label>
                <Textarea
                  id="params"
                  placeholder='{"emp": 1, "qty": 100}'
                  value={customParams}
                  onChange={(e) => setCustomParams(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={executeCustomEndpoint} disabled={!customEndpoint}>
                <Play className="h-4 w-4 mr-2" />
                Ejecutar Endpoint Personalizado
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {Object.keys(results).length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No hay resultados aún. Ejecuta algunos endpoints para ver los resultados aquí.
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(results).map(([key, result]) => <ResultCard key={key} result={result} resultKey={key} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
