"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Database, Tag, Package } from "lucide-react"

interface DebugResponse {
  endpoint: string
  method: string
  status: number
  data: any
  error?: string
  timestamp: string
}

export default function ZureoDebugPage() {
  const [responses, setResponses] = useState<DebugResponse[]>([])
  const [loading, setLoading] = useState<string | null>(null)

  const addResponse = (response: DebugResponse) => {
    setResponses((prev) => [response, ...prev.slice(0, 9)]) // Keep last 10 responses
  }

  const testEndpoint = async (endpoint: string, label: string) => {
    setLoading(endpoint)
    const timestamp = new Date().toISOString()

    try {
      console.log(`[v0] Testing ${label} endpoint: ${endpoint}`)

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      addResponse({
        endpoint: `${label} (${endpoint})`,
        method: "GET",
        status: response.status,
        data,
        timestamp,
      })

      console.log(`[v0] ${label} response:`, data)
    } catch (error) {
      console.error(`[v0] ${label} error:`, error)

      addResponse({
        endpoint: `${label} (${endpoint})`,
        method: "GET",
        status: 0,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp,
      })
    } finally {
      setLoading(null)
    }
  }

  const testZureoSync = async () => {
    setLoading("sync")
    const timestamp = new Date().toISOString()

    try {
      console.log("[v0] Testing Zureo sync endpoint")

      const response = await fetch("/api/zureo/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      addResponse({
        endpoint: "Zureo Sync (/api/zureo/sync)",
        method: "POST",
        status: response.status,
        data,
        timestamp,
      })

      console.log("[v0] Zureo sync response:", data)
    } catch (error) {
      console.error("[v0] Zureo sync error:", error)

      addResponse({
        endpoint: "Zureo Sync (/api/zureo/sync)",
        method: "POST",
        status: 0,
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp,
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Zureo API Debug</h1>
        <p className="text-muted-foreground">
          Herramienta de debug para verificar conexiones y respuestas de la API de Zureo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configuración de API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Endpoint Base:</strong> https://api.zureo.com
            </div>
            <div>
              <strong>Empresa:</strong> 1
            </div>
            <div>
              <strong>Límite por request:</strong> 1000 productos
            </div>
            <div>
              <strong>Paginación:</strong> Automática
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Probar Endpoints</CardTitle>
          <CardDescription>
            Haz clic en los botones para probar diferentes endpoints y ver las respuestas JSON
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => testEndpoint("/api/zureo/products", "Productos")}
              disabled={loading === "/api/zureo/products"}
              className="flex items-center gap-2"
            >
              {loading === "/api/zureo/products" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Package className="h-4 w-4" />
              )}
              Productos
            </Button>

            <Button
              onClick={() => testEndpoint("/api/zureo/brands", "Marcas")}
              disabled={loading === "/api/zureo/brands"}
              className="flex items-center gap-2"
            >
              {loading === "/api/zureo/brands" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Tag className="h-4 w-4" />
              )}
              Marcas
            </Button>

            <Button
              onClick={() => testEndpoint("/api/zureo/categories", "Categorías")}
              disabled={loading === "/api/zureo/categories"}
              className="flex items-center gap-2"
            >
              {loading === "/api/zureo/categories" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Categorías
            </Button>

            <Button onClick={testZureoSync} disabled={loading === "sync"} className="flex items-center gap-2">
              {loading === "sync" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Sincronizar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Respuestas de API</h2>

        {responses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No hay respuestas aún. Haz clic en los botones de arriba para probar los endpoints.
              </p>
            </CardContent>
          </Card>
        ) : (
          responses.map((response, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{response.endpoint}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={response.status === 200 ? "default" : "destructive"}>
                      {response.status === 0 ? "ERROR" : response.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(response.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {response.error ? (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
                    <p className="text-destructive font-medium">Error:</p>
                    <p className="text-sm">{response.error}</p>
                  </div>
                ) : (
                  <div className="bg-muted rounded-md p-4">
                    <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
