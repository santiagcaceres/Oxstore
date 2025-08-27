"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, CheckCircle, AlertCircle, Database } from "lucide-react"

export default function SincronizarPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSync = async () => {
    setIsLoading(true)
    setSyncStatus("idle")

    try {
      const response = await fetch("/api/sync-products", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setLastSync(data.timestamp)
        setSyncStatus("success")
      } else {
        setSyncStatus("error")
      }
    } catch (error) {
      console.error("Error syncing products:", error)
      setSyncStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sincronización de Productos</h1>
        <p className="text-muted-foreground">Sincroniza el inventario con la API de Zureo</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Estado de Sincronización
            </CardTitle>
            <CardDescription>Información sobre la última sincronización</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Estado:</span>
              {syncStatus === "success" && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Exitoso
                </Badge>
              )}
              {syncStatus === "error" && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Error
                </Badge>
              )}
              {syncStatus === "idle" && <Badge variant="secondary">Esperando</Badge>}
            </div>

            {lastSync && (
              <div className="flex items-center justify-between">
                <span>Última sincronización:</span>
                <span className="text-sm text-muted-foreground">{new Date(lastSync).toLocaleString("es-ES")}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sincronizar Ahora</CardTitle>
            <CardDescription>
              Obtiene todos los productos desde la API de Zureo con paginación automática
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSync} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar Productos
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Endpoint:</strong> https://020128150011
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
    </div>
  )
}
