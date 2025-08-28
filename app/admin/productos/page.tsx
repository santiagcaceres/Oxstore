"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, MoreHorizontal, Edit, Eye, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Product {
  id: number
  zureo_id: number
  name: string
  slug: string
  description: string
  price: number
  stock: number
  category: string
  brand: string
  image_url: string
  is_featured: boolean
  discount_percentage: number
  created_at: string
  updated_at: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<string | null>(null)

  useEffect(() => {
    loadProductsAutomatically()
  }, [])

  const loadProductsAutomatically = async () => {
    try {
      setLoading(true)
      setError(null)
      setSyncStatus("Obteniendo token de autenticación...")

      const response = await fetch("/api/zureo/products/sync")

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Error al sincronizar productos")
      }

      setSyncStatus("Productos sincronizados correctamente")

      await loadLocalProducts()

      setLastSync(new Date().toLocaleString())

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSyncStatus(null), 3000)
    } catch (error) {
      console.error("Error loading products:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const loadLocalProducts = async () => {
    try {
      const response = await fetch("/api/products/local")

      if (!response.ok) {
        throw new Error("Error al cargar productos locales")
      }

      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error("Error loading local products:", error)
      // Si falla la carga local, mostrar array vacío
      setProducts([])
    }
  }

  const manualSync = async () => {
    try {
      setSyncing(true)
      setError(null)
      setSyncStatus("Sincronizando productos...")

      const response = await fetch("/api/zureo/products/sync")

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Error al sincronizar productos")
      }

      setSyncStatus(`Sincronizados ${data.summary.totalInserted} productos`)
      await loadLocalProducts()
      setLastSync(new Date().toLocaleString())

      setTimeout(() => setSyncStatus(null), 3000)
    } catch (error) {
      console.error("Error syncing products:", error)
      setError(error instanceof Error ? error.message : "Error al sincronizar")
    } finally {
      setSyncing(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground">
            Catálogo de productos sincronizado automáticamente desde Zureo
            {lastSync && <span className="block text-xs mt-1">Última sincronización: {lastSync}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={manualSync} disabled={syncing || loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Sincronizando..." : "Sincronizar Ahora"}
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
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Productos con Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((p) => p.stock > 0).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Productos Destacados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((p) => p.is_featured).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Con Descuento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {products.filter((p) => p.discount_percentage > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>Productos sincronizados desde Zureo - Edita configuraciones locales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Sincronizando productos desde Zureo...</p>
                {syncStatus && <p className="text-sm text-muted-foreground mt-2">{syncStatus}</p>}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
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
                      <div>
                        <p className="font-medium">${product.price}</p>
                        {product.discount_percentage > 0 && (
                          <p className="text-sm text-green-600">-{product.discount_percentage}% descuento</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.stock === 0 ? "destructive" : product.stock <= 5 ? "secondary" : "default"}
                      >
                        {product.stock} unidades
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={product.stock > 0 ? "default" : "secondary"}>
                          {product.stock > 0 ? "Disponible" : "Sin Stock"}
                        </Badge>
                        {product.is_featured && <Badge variant="outline">Destacado</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/producto/${product.slug}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver en tienda
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/productos/${product.id}/editar`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar configuración
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No se encontraron productos que coincidan con la búsqueda."
                  : "No hay productos sincronizados desde Zureo."}
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
