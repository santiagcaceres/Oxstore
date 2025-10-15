"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, CheckCircle, AlertCircle, Database } from "lucide-react"
import { Popup } from "@/components/ui/popup"

export default function SincronizarPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle")
  const [showSyncingPopup, setShowSyncingPopup] = useState(false)
  const [showCompletedPopup, setShowCompletedPopup] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)

  const handleSync = async () => {
    setIsLoading(true)
    setSyncStatus("idle")
    setShowSyncingPopup(true)
    setShowCompletedPopup(false)

    try {
      const response = await fetch("/api/zureo/products/sync", {
        method: "GET",
      })

      if (response.ok) {
        const data = await response.json()
        setLastSync(data.summary?.syncTime || new Date().toISOString())
        setSyncStatus("success")
        setSyncResult(data.summary)
        setShowSyncingPopup(false)
        setShowCompletedPopup(true)
        setTimeout(() => setShowCompletedPopup(false), 5000)
      } else {
        setSyncStatus("error")
        setShowSyncingPopup(false)
        setShowCompletedPopup(true)
        setTimeout(() => setShowCompletedPopup(false), 5000)
      }
    } catch (error) {
      console.error("Error syncing products:", error)
      setSyncStatus("error")
      setShowSyncingPopup(false)
      setShowCompletedPopup(true)
      setTimeout(() => setShowCompletedPopup(false), 5000)
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

            {syncResult && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span>Productos sincronizados:</span>
                  <span className="font-medium">{syncResult.totalUpserted || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Con precio:</span>
                  <span className="font-medium">{syncResult.productsWithPrice || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Con color:</span>
                  <span className="font-medium">{syncResult.productsWithColor || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Con talle:</span>
                  <span className="font-medium">{syncResult.productsWithSize || 0}</span>
                </div>
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

      <Popup
        isOpen={showSyncingPopup}
        onClose={() => {}}
        title="Sincronizando productos"
        description="Por favor espera mientras sincronizamos los productos desde Zureo. Este proceso puede tardar varios minutos."
        showCloseButton={false}
      >
        <div className="flex flex-col items-center justify-center py-6">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mb-4" />
          <p className="text-center text-muted-foreground">
            Sincronizando productos...
            <br />
            No cierres esta ventana
          </p>
        </div>
      </Popup>

      <Popup
        isOpen={showCompletedPopup}
        onClose={() => setShowCompletedPopup(false)}
        title={syncStatus === "success" ? "Sincronización completada" : "Error en sincronización"}
        description={
          syncStatus === "success"
            ? "Los productos se han sincronizado correctamente"
            : "Hubo un error al sincronizar los productos"
        }
      >
        <div className="flex flex-col items-center justify-center py-4">
          {syncStatus === "success" ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
              {syncResult && (
                <div className="w-full space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Productos sincronizados:</span>
                    <span className="font-medium">{syncResult.totalUpserted || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Con stock:</span>
                    <span className="font-medium">{syncResult.totalWithStock || 0}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
              <p className="text-center text-muted-foreground">Por favor intenta nuevamente o contacta al soporte</p>
            </>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={() => setShowCompletedPopup(false)}>Cerrar</Button>
        </div>
      </Popup>
    </div>
  )
}
