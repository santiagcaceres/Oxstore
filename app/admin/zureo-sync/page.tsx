"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, CheckCircle, XCircle, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ZureoSyncPage() {
  const [brandsLoading, setBrandsLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)
  const [brandsResult, setBrandsResult] = useState<any>(null)
  const [productsResult, setProductsResult] = useState<any>(null)
  const [brandsError, setBrandsError] = useState<string | null>(null)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [savedProducts, setSavedProducts] = useState<any[]>([])
  const [savedBrands, setSavedBrands] = useState<any[]>([])
  const [showProducts, setShowProducts] = useState(false)

  useEffect(() => {
    loadSavedData()
  }, [])

  const loadSavedData = async () => {
    const supabase = createClient()

    // Cargar productos guardados
    const { data: products } = await supabase
      .from("products_in_stock")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    // Cargar marcas guardadas
    const { data: brands } = await supabase
      .from("brands")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    if (products) setSavedProducts(products)
    if (brands) setSavedBrands(brands)
  }

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
      await loadSavedData()
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
      await loadSavedData()
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

            {savedBrands.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Marcas en base de datos ({savedBrands.length})</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {savedBrands.slice(0, 5).map((brand) => (
                    <div key={brand.id} className="text-xs p-2 bg-muted rounded">
                      {brand.name} (ID: {brand.zureo_id})
                    </div>
                  ))}
                </div>
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
                  <Badge variant="outline">{productsResult.productsWithStock} con stock</Badge>
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

            {savedProducts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Productos en base de datos ({savedProducts.length})</h4>
                  <Button variant="outline" size="sm" onClick={() => setShowProducts(!showProducts)}>
                    <Eye className="h-3 w-3 mr-1" />
                    {showProducts ? "Ocultar" : "Ver"}
                  </Button>
                </div>
                {showProducts && (
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {savedProducts.map((product) => (
                      <div key={product.id} className="text-xs p-2 bg-muted rounded">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-muted-foreground">
                          ${product.price} - Stock: {product.stock_quantity} - {product.category}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
