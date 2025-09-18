"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, RefreshCw, AlertCircle, CheckCircle, Package, Palette, Ruler } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductVariant {
  id: number
  product_id: number
  zureo_variety_id: number | null
  color: string | null
  size: string | null
  stock_quantity: number
  price: number
  variety_name: string
  variety_data: any
  created_at: string
  updated_at: string
  // Datos del producto relacionado
  product_name: string
  product_zureo_code: string
  product_brand: string
  product_category: string
}

interface VariantStats {
  totalVariants: number
  totalProducts: number
  uniqueColors: number
  uniqueSizes: number
  totalStock: number
  averagePrice: number
}

export default function AdminVariantsPage() {
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [filteredVariants, setFilteredVariants] = useState<ProductVariant[]>([])
  const [stats, setStats] = useState<VariantStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [colorFilter, setColorFilter] = useState("all")
  const [sizeFilter, setSizeFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [error, setError] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadVariants()
  }, [])

  useEffect(() => {
    filterVariants()
  }, [variants, searchTerm, colorFilter, sizeFilter, stockFilter])

  const loadVariants = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[v0] Loading all product variants...")

      // Cargar variantes con información del producto
      const { data: variantsData, error: variantsError } = await supabase
        .from("product_variants")
        .select(`
          *,
          products_in_stock!inner(
            name,
            zureo_code,
            brand,
            category
          )
        `)
        .order("created_at", { ascending: false })

      if (variantsError) {
        throw new Error(`Error cargando variantes: ${variantsError.message}`)
      }

      // Transformar datos para incluir información del producto
      const transformedVariants =
        variantsData?.map((variant: any) => ({
          ...variant,
          product_name: variant.products_in_stock.name,
          product_zureo_code: variant.products_in_stock.zureo_code,
          product_brand: variant.products_in_stock.brand,
          product_category: variant.products_in_stock.category,
        })) || []

      console.log(`[v0] Loaded ${transformedVariants.length} variants`)
      setVariants(transformedVariants)

      // Calcular estadísticas
      calculateStats(transformedVariants)
    } catch (error) {
      console.error("Error loading variants:", error)
      setError(error instanceof Error ? error.message : "Error cargando variantes")
      setVariants([])
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (variantsData: ProductVariant[]) => {
    const uniqueProducts = new Set(variantsData.map((v) => v.product_id)).size
    const uniqueColors = new Set(variantsData.map((v) => v.color).filter(Boolean)).size
    const uniqueSizes = new Set(variantsData.map((v) => v.size).filter(Boolean)).size
    const totalStock = variantsData.reduce((sum, v) => sum + v.stock_quantity, 0)
    const averagePrice =
      variantsData.length > 0 ? variantsData.reduce((sum, v) => sum + v.price, 0) / variantsData.length : 0

    setStats({
      totalVariants: variantsData.length,
      totalProducts: uniqueProducts,
      uniqueColors,
      uniqueSizes,
      totalStock,
      averagePrice,
    })
  }

  const filterVariants = () => {
    let filtered = variants

    // Filtro por búsqueda de texto
    if (searchTerm) {
      filtered = filtered.filter(
        (variant) =>
          variant.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          variant.product_zureo_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          variant.product_brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          variant.variety_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (variant.color && variant.color.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (variant.size && variant.size.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filtro por color
    if (colorFilter !== "all") {
      filtered = filtered.filter((variant) => variant.color === colorFilter)
    }

    // Filtro por talle
    if (sizeFilter !== "all") {
      filtered = filtered.filter((variant) => variant.size === sizeFilter)
    }

    // Filtro por stock
    if (stockFilter !== "all") {
      switch (stockFilter) {
        case "sin-stock":
          filtered = filtered.filter((variant) => variant.stock_quantity === 0)
          break
        case "poco-stock":
          filtered = filtered.filter((variant) => variant.stock_quantity > 0 && variant.stock_quantity <= 5)
          break
        case "con-stock":
          filtered = filtered.filter((variant) => variant.stock_quantity > 5)
          break
      }
    }

    setFilteredVariants(filtered)
  }

  const syncVariants = async () => {
    try {
      setSyncing(true)
      setError(null)
      setSyncStatus("Sincronizando productos y variantes...")

      const response = await fetch("/api/zureo/products/sync", {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Error al sincronizar")
      }

      setSyncStatus(
        `Sincronización completada: ${data.summary.totalVariantsCreated} variantes creadas de ${data.summary.totalInserted} productos`,
      )

      await loadVariants()

      setTimeout(() => setSyncStatus(null), 5000)
    } catch (error) {
      console.error("Error syncing variants:", error)
      setError(error instanceof Error ? error.message : "Error al sincronizar")
    } finally {
      setSyncing(false)
    }
  }

  const getUniqueColors = () => {
    return ["all", ...new Set(variants.map((v) => v.color).filter(Boolean))].sort()
  }

  const getUniqueSizes = () => {
    return ["all", ...new Set(variants.map((v) => v.size).filter(Boolean))].sort()
  }

  const clearFilters = () => {
    setSearchTerm("")
    setColorFilter("all")
    setSizeFilter("all")
    setStockFilter("all")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Variantes</h1>
          <p className="text-muted-foreground">Administra todas las variantes de productos (talles, colores y stock)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncVariants} disabled={syncing || loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Sincronizando..." : "Sincronizar Variantes"}
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

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Total Variantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalVariants}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Colores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.uniqueColors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Talles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.uniqueSizes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.totalStock}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Math.round(stats.averagePrice)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
          <CardDescription>Filtra las variantes por diferentes criterios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Buscar producto, código, marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={colorFilter} onValueChange={setColorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los colores</SelectItem>
                {getUniqueColors()
                  .slice(1)
                  .map((color) => (
                    <SelectItem key={color} value={color}>
                      {color.toUpperCase()}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por talle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los talles</SelectItem>
                {getUniqueSizes()
                  .slice(1)
                  .map((size) => (
                    <SelectItem key={size} value={size}>
                      {size.toUpperCase()}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el stock</SelectItem>
                <SelectItem value="sin-stock">Sin stock (0)</SelectItem>
                <SelectItem value="poco-stock">Poco stock (1-5)</SelectItem>
                <SelectItem value="con-stock">Con stock (5+)</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Variantes */}
      <Card>
        <CardHeader>
          <CardTitle>Variantes de Productos</CardTitle>
          <CardDescription>
            {filteredVariants.length} de {variants.length} variantes mostradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Cargando variantes...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Código Zureo</TableHead>
                  <TableHead>Variante</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Talle</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Marca</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVariants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{variant.product_name}</p>
                        <p className="text-sm text-muted-foreground">{variant.product_category}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {variant.product_zureo_code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{variant.variety_name}</Badge>
                    </TableCell>
                    <TableCell>
                      {variant.color ? (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {variant.color.toUpperCase()}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {variant.size ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {variant.size.toUpperCase()}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          variant.stock_quantity === 0
                            ? "destructive"
                            : variant.stock_quantity <= 5
                              ? "secondary"
                              : "default"
                        }
                        className={
                          variant.stock_quantity > 5
                            ? "bg-green-100 text-green-800"
                            : variant.stock_quantity > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : ""
                        }
                      >
                        {variant.stock_quantity} unidades
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">${variant.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="text-sm">{variant.product_brand}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {filteredVariants.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || colorFilter !== "all" || sizeFilter !== "all" || stockFilter !== "all"
                  ? "No se encontraron variantes que coincidan con los filtros."
                  : "No hay variantes disponibles."}
              </p>
              {!searchTerm && colorFilter === "all" && sizeFilter === "all" && stockFilter === "all" && (
                <Button onClick={syncVariants} className="mt-4" disabled={syncing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                  Sincronizar Variantes
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
