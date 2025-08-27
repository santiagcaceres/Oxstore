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
import { Search, MoreHorizontal, Edit, Eye, RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ZureoProduct {
  id: number
  codigo: string
  descripcion: string
  marca: string
  rubro: string
  precio: number
  stock: number
  activo: boolean
  // Local customizations
  local_images?: string[]
  local_description?: string
  local_price?: number
  is_featured?: boolean
  slug?: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ZureoProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/zureo/products")

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setProducts(data.products || [])
      setLastSync(new Date().toLocaleString())
    } catch (error) {
      console.error("Error loading products:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const syncProducts = async () => {
    try {
      setSyncing(true)
      setError(null)
      const response = await fetch("/api/sync-products", { method: "POST" })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      await loadProducts()
    } catch (error) {
      console.error("Error syncing products:", error)
      setError(error instanceof Error ? error.message : "Error al sincronizar")
    } finally {
      setSyncing(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.rubro.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground">
            Gestiona el catálogo de productos sincronizado desde Zureo
            {lastSync && <span className="block text-xs mt-1">Última sincronización: {lastSync}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncProducts} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Sincronizando..." : "Sincronizar"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
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
            <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((p) => p.activo).length}</div>
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
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{products.filter((p) => p.stock <= 5).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>
            Productos sincronizados desde Zureo - Edita imágenes y configuraciones locales
          </CardDescription>
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
                <p className="text-muted-foreground">Cargando productos desde Zureo...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Código</TableHead>
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
                            src={product.local_images?.[0] || "/generic-product-display.png"}
                            alt={product.descripcion}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{product.descripcion}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.marca} • {product.rubro}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.codigo}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">${product.local_price || product.precio}</p>
                        {product.local_price && product.local_price !== product.precio && (
                          <p className="text-sm text-muted-foreground">Zureo: ${product.precio}</p>
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
                        <Badge variant={product.activo ? "default" : "secondary"}>
                          {product.activo ? "Activo" : "Inactivo"}
                        </Badge>
                        {product.is_featured && <Badge variant="outline">Destacado</Badge>}
                        {product.local_images?.length && (
                          <Badge variant="outline" className="text-xs">
                            {product.local_images.length} imagen{product.local_images.length > 1 ? "es" : ""}
                          </Badge>
                        )}
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
                            <Link href={`/producto/${product.slug || product.codigo}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver en tienda
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/productos/${product.id}/editar`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar imágenes y configuración
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
                <Button onClick={syncProducts} className="mt-4" disabled={syncing}>
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
