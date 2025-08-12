"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Tag, Building2, RefreshCw, Search, Eye, AlertCircle, CheckCircle, Clock } from "lucide-react"

interface ZureoStats {
  products: number
  brands: number
  companies: number
  activeProducts: number
  inactiveProducts: number
}

interface ZureoProduct {
  id: string
  codigo: string
  descripcion: string
  marca: string
  precio: number
  stock: number
  baja: boolean
  rubro?: string
  subrubro?: string
}

interface ZureoBrand {
  id: string
  nombre: string
  descripcion?: string
  activo: boolean
}

export default function ZureoPage() {
  const [stats, setStats] = useState<ZureoStats>({
    products: 0,
    brands: 0,
    companies: 0,
    activeProducts: 0,
    inactiveProducts: 0,
  })
  const [products, setProducts] = useState<ZureoProduct[]>([])
  const [brands, setBrands] = useState<ZureoBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")

  useEffect(() => {
    loadZureoData()
  }, [])

  const loadZureoData = async () => {
    try {
      setLoading(true)
      setConnectionStatus("checking")

      // Cargar productos
      const productsResponse = await fetch("/api/zureo/products")
      const productsData = await productsResponse.json()

      if (productsResponse.ok) {
        setProducts(productsData)
        setConnectionStatus("connected")
      } else {
        throw new Error(productsData.error || "Error loading products")
      }

      // Cargar marcas
      const brandsResponse = await fetch("/api/zureo/brands")
      const brandsData = await brandsResponse.json()

      if (brandsResponse.ok) {
        setBrands(brandsData)
      }

      // Calcular estadísticas
      const activeProducts = productsData.filter((p: ZureoProduct) => !p.baja)
      const inactiveProducts = productsData.filter((p: ZureoProduct) => p.baja)

      setStats({
        products: productsData.length,
        brands: brandsData.length,
        companies: 1, // Por ahora solo una empresa
        activeProducts: activeProducts.length,
        inactiveProducts: inactiveProducts.length,
      })
    } catch (error) {
      console.error("Error loading Zureo data:", error)
      setConnectionStatus("error")
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.marca.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredBrands = brands.filter((brand) => brand.nombre.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Panel Zureo</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Panel Zureo</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {connectionStatus === "checking" && (
              <>
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-yellow-600">Verificando...</span>
              </>
            )}
            {connectionStatus === "connected" && (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Conectado</span>
              </>
            )}
            {connectionStatus === "error" && (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Error de conexión</span>
              </>
            )}
          </div>
          <Button onClick={loadZureoData} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Inactivos</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactiveProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marcas</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.brands}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.companies}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para productos y marcas */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Productos ({stats.products})</TabsTrigger>
          <TabsTrigger value="brands">Marcas ({stats.brands})</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {/* Buscador de productos */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar productos por nombre, código o marca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de productos */}
          <div className="grid gap-4">
            {filteredProducts.slice(0, 50).map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{product.descripcion}</h3>
                        {product.baja ? (
                          <Badge variant="destructive" className="text-xs">
                            Inactivo
                          </Badge>
                        ) : (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            Activo
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Código:</span> {product.codigo}
                        </div>
                        <div>
                          <span className="font-medium">Marca:</span> {product.marca}
                        </div>
                        <div>
                          <span className="font-medium">Precio:</span> ${product.precio?.toLocaleString() || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Stock:</span> {product.stock || 0}
                        </div>
                      </div>
                      {(product.rubro || product.subrubro) && (
                        <div className="mt-2 text-sm text-gray-500">
                          {product.rubro} {product.subrubro && `> ${product.subrubro}`}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length > 50 && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-gray-600">
                  Mostrando 50 de {filteredProducts.length} productos. Usa el buscador para filtrar.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="brands" className="space-y-4">
          {/* Buscador de marcas */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar marcas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de marcas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBrands.map((brand) => (
              <Card key={brand.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{brand.nombre}</CardTitle>
                    {brand.activo ? (
                      <Badge className="text-xs bg-green-100 text-green-800">Activa</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Inactiva
                      </Badge>
                    )}
                  </div>
                  {brand.descripcion && <p className="text-sm text-gray-600">{brand.descripcion}</p>}
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500">
                    Productos: {products.filter((p) => p.marca === brand.nombre).length}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
