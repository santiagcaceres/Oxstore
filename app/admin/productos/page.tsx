"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Eye, Edit, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ZureoProduct {
  codigo: string
  descripcion: string
  marca: string
  precio: number
  stock?: number
  rubro?: string
  subrubro?: string
  baja?: boolean
}

export default function ProductosPage() {
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<ZureoProduct[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/zureo/products")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error loading products from Zureo")
      }

      // Filter out inactive products
      const activeProducts = data.filter((product: ZureoProduct) => !product.baja)
      setProducts(activeProducts)
    } catch (error) {
      console.error("Error loading products:", error)
      setError(error instanceof Error ? error.message : "Error desconocido al cargar productos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const filteredProducts = products.filter(
    (product) =>
      product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const productsWithStock = filteredProducts.filter((product) => (product.stock || 0) > 0)
  const completeProducts = filteredProducts.filter((product) => product.marca && product.descripcion && product.codigo)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Cargando productos desde Zureo API...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestión de Productos</h1>
          <Button onClick={loadProducts} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error cargando productos desde Zureo:</strong> {error}
            <br />
            <br />
            Verifica que las credenciales de Zureo estén configuradas correctamente.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {products.length} productos desde Zureo
          </Badge>
          <Button onClick={loadProducts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Cargando..." : "Actualizar"}
          </Button>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Datos en tiempo real:</strong> Todos los productos mostrados provienen directamente de la API de
          Zureo. No se utilizan datos de demostración.
        </AlertDescription>
      </Alert>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, marca o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="stock" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stock">Con Stock ({productsWithStock.length})</TabsTrigger>
          <TabsTrigger value="complete">Completos ({completeProducts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Productos con Stock Disponible (Zureo)</CardTitle>
            </CardHeader>
            <CardContent>
              {productsWithStock.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No se encontraron productos con stock en Zureo</div>
              ) : (
                <div className="grid gap-4">
                  {productsWithStock.map((product) => (
                    <div key={product.codigo} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.descripcion}</h3>
                          <p className="text-sm text-gray-600">
                            {product.marca} • Código: {product.codigo}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline">Stock: {product.stock || 0}</Badge>
                            <Badge variant="secondary">${product.precio}</Badge>
                            {product.rubro && <Badge variant="outline">{product.rubro}</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complete" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Productos Completos (Zureo)</CardTitle>
            </CardHeader>
            <CardContent>
              {completeProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron productos completos en Zureo (con marca, nombre y descripción)
                </div>
              ) : (
                <div className="grid gap-4">
                  {completeProducts.map((product) => (
                    <div key={product.codigo} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.descripcion}</h3>
                          <p className="text-sm text-gray-600">
                            {product.marca} • Código: {product.codigo}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline">Stock: {product.stock || 0}</Badge>
                            <Badge variant="secondary">${product.precio}</Badge>
                            {product.rubro && <Badge variant="outline">{product.rubro}</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
