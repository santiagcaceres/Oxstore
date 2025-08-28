"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, CheckCircle, XCircle } from "lucide-react"

export default function ZureoSyncPage() {
  const [brandsLoading, setBrandsLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)
  const [brandsResult, setBrandsResult] = useState<any>(null)
  const [productsResult, setProductsResult] = useState<any>(null)
  const [brandsError, setBrandsError] = useState<string | null>(null)
  const [productsError, setProductsError] = useState<string | null>(null)

  const syncBrands = async () => {
    setBrandsLoading(true)
    setBrandsError(null)
    setBrandsResult(null)

    try {
      const response = await fetch("/api/zureo/sync-brands", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al sincronizar marcas")
      }

      setBrandsResult(data)
    } catch (error) {
      setBrandsError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setBrandsLoading(false)
    }
  }

  const syncProducts = async () => {
    setProductsLoading(true)
    setProductsError(null)
    setProductsResult(null)

    try {
      const response = await fetch("/api/zureo/sync-products-simple", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al sincronizar productos")
      }

      setProductsResult(data)
    } catch (error) {
      setProductsError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setProductsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sincronización Zureo</h1>
        <p className="text-muted-foreground">Sincroniza marcas y productos desde la API de Zureo</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sección Marcas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Sincronizar Marcas
            </CardTitle>
            <CardDescription>
              Obtiene todas las marcas desde Zureo y las guarda en la base de datos local
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={syncBrands} disabled={brandsLoading} className="w-full">
              {brandsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Sincronizar Marcas
                </>
              )}
            </Button>

            {brandsError && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{brandsError}</span>
              </div>
            )}

            {brandsResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Sincronización completada</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{brandsResult.totalBrands} marcas obtenidas</Badge>
                  <Badge variant="outline">{brandsResult.savedBrands} guardadas</Badge>
                </div>
                <details className="mt-2">
                  <summary className="text-sm cursor-pointer hover:underline">Ver respuesta JSON</summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(brandsResult, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sección Productos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Sincronizar Productos
            </CardTitle>
            <CardDescription>Obtiene todos los productos desde Zureo con paginación automática</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={syncProducts} disabled={productsLoading} className="w-full">
              {productsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Sincronizar Productos
                </>
              )}
            </Button>

            {productsError && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{productsError}</span>
              </div>
            )}

            {productsResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Sincronización completada</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary">{productsResult.totalProducts} productos obtenidos</Badge>
                  <Badge variant="outline">{productsResult.savedProducts} guardados</Badge>
                  <Badge variant="outline">{productsResult.requests} requests realizados</Badge>
                </div>
                <details className="mt-2">
                  <summary className="text-sm cursor-pointer hover:underline">Ver respuesta JSON</summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(productsResult, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
