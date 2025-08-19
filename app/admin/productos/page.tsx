"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Package, TrendingUp, DollarSign, ShoppingCart, Edit } from "lucide-react"

interface ProductWithStock {
  id: number
  codigo: string
  nombre: string
  stock: number
  precio: number
  marca: {
    id: number
    nombre: string | null
  }
  tipo: {
    id: number
    nombre: string
  }
  variedades: any[]
  fechaAlta: string
  fechaModificado: string
  descripcionCorta: string | null
  descripcionLarga: string | null
  impuesto: number
  unidadMedida: string
}

interface ProductsWithStockResponse {
  success: boolean
  data: ProductWithStock[]
  message: string
  totalProducts: number
  productsWithStock: number
  totalStockValue: number
}

export default function ProductosPage() {
  const [products, setProducts] = useState<ProductWithStock[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductWithStock[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState({
    totalProducts: 0,
    productsWithStock: 0,
    totalStockValue: 0,
  })
  const router = useRouter()

  useEffect(() => {
    loadProductsWithStock()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm])

  const loadProductsWithStock = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/zureo/products-with-stock")
      const data: ProductsWithStockResponse = await response.json()

      if (data.success) {
        setProducts(data.data)
        setStats({
          totalProducts: data.totalProducts,
          productsWithStock: data.productsWithStock,
          totalStockValue: data.totalStockValue,
        })
      } else {
        console.error("Error loading products:", data.error)
      }
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    const searchLower = searchTerm.toLowerCase()

    const filterFn = (product: ProductWithStock) =>
      product.nombre.toLowerCase().includes(searchLower) ||
      product.codigo.toLowerCase().includes(searchLower) ||
      product.marca?.nombre?.toLowerCase().includes(searchLower)

    setFilteredProducts(products.filter(filterFn))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleEditProduct = (codigo: string) => {
    router.push(`/admin/productos/${codigo}`)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard de Productos</h1>
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
        <h1 className="text-3xl font-bold">Dashboard de Productos</h1>
        <Badge variant="outline" className="text-sm">
          Última actualización: {new Date().toLocaleString("es-UY")}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">En el catálogo completo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Stock</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.productsWithStock}</div>
            <p className="text-xs text-muted-foreground">Productos disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Stock</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatPrice(stats.totalStockValue)}</div>
            <p className="text-xs text-muted-foreground">Inventario valorizado</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, código o marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Productos con Stock Disponible</h2>
          <p className="text-sm text-gray-600">
            Mostrando {filteredProducts.length} de {products.length} productos
          </p>
        </div>
        <Button onClick={loadProductsWithStock} variant="outline" size="sm">
          <TrendingUp className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <Card key={product.codigo} className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm line-clamp-2 mb-1">{product.nombre}</CardTitle>
                  <p className="text-xs text-gray-500">Código: {product.codigo}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Stock: {product.stock}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Product placeholder image */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Precio:</span>
                  <span className="font-semibold text-sm">{formatPrice(product.precio)}</span>
                </div>

                {product.marca?.nombre && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Marca:</span>
                    <span className="font-medium text-sm">{product.marca.nombre}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Valor Stock:</span>
                  <span className="font-medium text-sm text-green-600">
                    {formatPrice(product.stock * product.precio)}
                  </span>
                </div>
              </div>

              {/* Product description */}
              {product.descripcionCorta && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-600 line-clamp-2">{product.descripcionCorta}</p>
                </div>
              )}

              {/* Edit button for each product */}
              <div className="pt-2 border-t">
                <Button
                  onClick={() => handleEditProduct(product.codigo)}
                  variant="outline"
                  size="sm"
                  className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Producto
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay productos con stock</h3>
            <p className="text-gray-500">No se encontraron productos disponibles que coincidan con tu búsqueda</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
