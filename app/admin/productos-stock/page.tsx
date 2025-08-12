"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Package, AlertCircle } from "lucide-react"

interface ProductWithStock {
  id: string
  name: string
  code: string
  brand: string
  stock: number
  price: number
  category: string
  active: boolean
}

export default function ProductosStockPage() {
  const [products, setProducts] = useState<ProductWithStock[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductWithStock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("")

  useEffect(() => {
    fetchProductsWithStock()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedBrand])

  const fetchProductsWithStock = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/zureo/products-with-stock")

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setProducts(data.products || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching products with stock:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products.filter((product) => product.stock > 0)

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedBrand) {
      filtered = filtered.filter((product) => product.brand === selectedBrand)
    }

    setFilteredProducts(filtered)
  }

  const uniqueBrands = [...new Set(products.map((p) => p.brand))].sort()
  const totalStock = filteredProducts.reduce((sum, product) => sum + product.stock, 0)
  const totalValue = filteredProducts.reduce((sum, product) => sum + product.stock * product.price, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="h-12 w-12 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Cargando productos con stock...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error de Conexión</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchProductsWithStock} variant="outline">
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Productos con Stock</h1>
        <p className="text-gray-600">Gestiona todos los productos que tienen stock disponible</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{filteredProducts.length}</div>
            <p className="text-sm text-gray-600">Productos con Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{totalStock}</div>
            <p className="text-sm text-gray-600">Unidades Totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{uniqueBrands.length}</div>
            <p className="text-sm text-gray-600">Marcas Activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">${totalValue.toLocaleString("es-UY")}</div>
            <p className="text-sm text-gray-600">Valor Total Stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nombre, código o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las marcas</option>
          {uniqueBrands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                <Badge variant={product.active ? "default" : "secondary"}>
                  {product.active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <CardDescription>
                Código: {product.code} | {product.category}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Marca:</span>
                  <Badge variant="outline">{product.brand}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Stock:</span>
                  <span
                    className={`font-bold ${
                      product.stock > 10 ? "text-green-600" : product.stock > 5 ? "text-yellow-600" : "text-red-600"
                    }`}
                  >
                    {product.stock} unidades
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Precio:</span>
                  <span className="font-bold text-blue-600">${product.price.toLocaleString("es-UY")} UYU</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium text-gray-700">Valor Stock:</span>
                  <span className="font-bold text-purple-600">
                    ${(product.stock * product.price).toLocaleString("es-UY")} UYU
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay productos con stock</h3>
          <p className="text-gray-600">
            {searchTerm || selectedBrand
              ? "No se encontraron productos que coincidan con los filtros aplicados."
              : "No hay productos con stock disponible en este momento."}
          </p>
        </div>
      )}
    </div>
  )
}
