"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Edit, RefreshCw, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"

interface Product {
  id: number
  zureo_id: string
  zureo_code: string
  name: string
  description: string
  price: number
  stock_quantity: number
  category: string
  brand: string
  color: string | null
  size: string | null
  image_url: string
  is_featured: boolean
  created_at: string
  updated_at: string
  last_sync_at: string
  zureo_data: any
}

interface GroupedProduct {
  zureo_code: string
  name: string
  brand: string
  category: string
  image_url: string
  is_featured: boolean
  variants: Product[]
  totalStock: number
  price: number
}

const PRODUCTS_PER_PAGE = 100

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [groupedProducts, setGroupedProducts] = useState<GroupedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<string | null>(null)
  const [fromCache, setFromCache] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalUniqueProducts, setTotalUniqueProducts] = useState(0)
  const [totalAllVariants, setTotalAllVariants] = useState(0)

  useEffect(() => {
    loadLocalProducts()
  }, [currentPage])

  const loadLocalProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      const { count: totalVariantsCount } = await supabase
        .from("products_in_stock")
        .select("*", { count: "exact", head: true })
        .gt("stock_quantity", 0)
        .eq("is_active", true)

      setTotalProducts(totalVariantsCount || 0)
      setTotalAllVariants(totalVariantsCount || 0)

      const { data: uniqueCodesData } = await supabase
        .from("products_in_stock")
        .select("zureo_code")
        .gt("stock_quantity", 0)
        .eq("is_active", true)

      const uniqueCodes = new Set(uniqueCodesData?.map((p) => p.zureo_code) || [])
      setTotalUniqueProducts(uniqueCodes.size)

      const from = (currentPage - 1) * PRODUCTS_PER_PAGE
      const to = from + PRODUCTS_PER_PAGE - 1

      const { data: products, error } = await supabase
        .from("products_in_stock")
        .select("*")
        .gt("stock_quantity", 0)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(from, to)

      if (error) {
        throw new Error(`Error cargando productos: ${error.message}`)
      }

      console.log("[v0] Loaded products from database:", products?.length || 0, "of", totalVariantsCount || 0)
      setProducts(products || [])

      const grouped = groupProductsByCode(products || [])
      setGroupedProducts(grouped)
      setFromCache(false)
    } catch (error) {
      console.error("Error loading products from database:", error)
      setError(error instanceof Error ? error.message : "Error cargando productos")
      setProducts([])
      setGroupedProducts([])
    } finally {
      setLoading(false)
    }
  }

  const manualSync = async () => {
    try {
      setSyncing(true)
      setError(null)
      setSyncStatus("Forzando sincronización...")

      const response = await fetch("/api/zureo/sync-products-simple", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Error al sincronizar productos")
      }

      setSyncStatus(
        `Sincronizados ${data.savedProducts} productos con stock de ${data.totalProducts} productos totales`,
      )
      setCurrentPage(1)
      await loadLocalProducts()
      setLastSync(data.timestamp)
      setFromCache(false)

      setTimeout(() => setSyncStatus(null), 3000)
    } catch (error) {
      console.error("Error syncing products:", error)
      setError(error instanceof Error ? error.message : "Error al sincronizar")
    } finally {
      setSyncing(false)
    }
  }

  const groupProductsByCode = (products: Product[]): GroupedProduct[] => {
    const grouped = new Map<string, GroupedProduct>()

    products.forEach((product) => {
      const code = product.zureo_code
      if (!grouped.has(code)) {
        grouped.set(code, {
          zureo_code: code,
          name: product.name,
          brand: product.brand,
          category: product.category,
          image_url: product.image_url,
          is_featured: product.is_featured,
          variants: [],
          totalStock: 0,
          price: product.price,
        })
      }

      const group = grouped.get(code)!
      group.variants.push(product)
      group.totalStock += product.stock_quantity
    })

    return Array.from(grouped.values())
  }

  const formatStockBySizes = (variants: Product[]): string => {
    const sizes = variants.map((v) => v.size).filter(Boolean)
    const uniqueSizes = [...new Set(sizes)]

    if (uniqueSizes.length === 0 || uniqueSizes.length === 1) {
      const totalStock = variants.reduce((sum, v) => sum + v.stock_quantity, 0)
      return `Talle único: ${totalStock} unidades`
    }

    const stockBySize = new Map<string, number>()
    variants.forEach((variant) => {
      const size = variant.size || "Sin talle"
      stockBySize.set(size, (stockBySize.get(size) || 0) + variant.stock_quantity)
    })

    return Array.from(stockBySize.entries())
      .map(([size, stock]) => `${size}: ${stock}`)
      .join(", ")
  }

  const filteredProducts = groupedProducts.filter(
    (product) =>
      product.totalStock > 0 &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.zureo_code.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Productos con Stock</h1>
          <p className="text-muted-foreground">
            Solo productos con stock disponible - Sincronización automática cada 24 horas
            {lastSync && (
              <span className="block text-xs mt-1">
                Última sincronización: {new Date(lastSync).toLocaleString()}
                {fromCache && " (desde cache)"}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={manualSync} disabled={syncing || loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Sincronizando..." : "Forzar Sincronización"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {syncStatus && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{syncStatus}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalUniqueProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Por código Zureo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Variantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalAllVariants}</div>
            <p className="text-xs text-muted-foreground mt-1">Todas las combinaciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Productos Destacados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupedProducts.filter((p) => p.is_featured).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Con Descuento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos Disponibles</CardTitle>
          <CardDescription>
            Solo productos con stock disponible - Edita imágenes, nombres y descripciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Buscar por nombre, código, marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Mostrando {(currentPage - 1) * PRODUCTS_PER_PAGE + 1} -{" "}
              {Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts)} de {totalProducts}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Cargando productos con stock...</p>
                {syncStatus && <p className="text-sm text-muted-foreground mt-2">{syncStatus}</p>}
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock por Talle</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.zureo_code}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={product.image_url || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.brand} • {product.category}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.zureo_code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">${product.price.toLocaleString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatStockBySizes(product.variants)}</div>
                        <Badge
                          variant={product.totalStock <= 5 ? "secondary" : "default"}
                          className="bg-green-100 text-green-800 mt-1"
                        >
                          Total: {product.totalStock}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Disponible
                          </Badge>
                          {product.is_featured && <Badge variant="outline">Destacado</Badge>}
                          {product.variants.length > 1 && (
                            <Badge variant="outline" className="text-xs">
                              {product.variants.length} variantes
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/productos/${product.variants[0].id}/editar`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || loading}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No se encontraron productos con stock que coincidan con la búsqueda."
                  : "No hay productos con stock disponible."}
              </p>
              {!searchTerm && (
                <Button onClick={manualSync} className="mt-4" disabled={syncing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                  Sincronizar productos
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
