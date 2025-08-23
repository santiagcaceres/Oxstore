"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Package, CheckCircle, XCircle, ImageIcon } from "lucide-react"
import { getAllZureoProducts } from "@/lib/zureo-api"
import { getProductImages } from "@/lib/supabase"
import type { ZureoProduct } from "@/types/zureo"

interface ProductWithStatus extends ZureoProduct {
  hasImage: boolean
  isComplete: boolean
}

export default function ProductosPage() {
  const [products, setProducts] = useState<ProductWithStatus[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "complete" | "incomplete">("all")

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, filter])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const zureoProducts = await getAllZureoProducts()

      // Verificar estado de cada producto
      const productsWithStatus = await Promise.all(
        zureoProducts.map(async (product) => {
          const images = await getProductImages(product.codigo)
          const hasImage = images.length > 0
          const hasPrice = product.precio > 0
          const hasBrand = product.marca?.nombre && product.marca.nombre.trim() !== ""

          return {
            ...product,
            hasImage,
            isComplete: hasImage && hasPrice && hasBrand,
          }
        }),
      )

      setProducts(productsWithStatus)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.marca?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrar por completitud
    if (filter === "complete") {
      filtered = filtered.filter((product) => product.isComplete)
    } else if (filter === "incomplete") {
      filtered = filtered.filter((product) => !product.isComplete)
    }

    setFilteredProducts(filtered)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Productos</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </div>
    )
  }

  const completeCount = products.filter((p) => p.isComplete).length
  const incompleteCount = products.length - completeCount

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Productos</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            Total: {products.length}
          </Badge>
          <Badge variant="outline" className="text-sm text-green-600">
            Completos: {completeCount}
          </Badge>
          <Badge variant="outline" className="text-sm text-red-600">
            Incompletos: {incompleteCount}
          </Badge>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, código o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtros de estado */}
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className={filter === "all" ? "bg-black hover:bg-gray-800" : ""}
              >
                Todos
              </Button>
              <Button
                variant={filter === "complete" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("complete")}
                className={filter === "complete" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                Completos
              </Button>
              <Button
                variant={filter === "incomplete" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("incomplete")}
                className={filter === "incomplete" ? "bg-red-600 hover:bg-red-700" : ""}
              >
                Incompletos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de productos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{product.nombre}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Código: {product.codigo}</p>
                </div>
                <div className="ml-2">
                  {product.isComplete ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Información del producto */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Precio:</span>
                  <span className="font-semibold">
                    {product.precio > 0 ? formatPrice(product.precio) : "Sin precio"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Marca:</span>
                  <span className="font-medium">{product.marca?.nombre || "Sin marca"}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Stock:</span>
                  <span className="font-medium">{product.stock}</span>
                </div>
              </div>

              {/* Estado de completitud */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Imagen:</span>
                  <div className="flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" />
                    {product.hasImage ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Precio:</span>
                  {product.precio > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Marca:</span>
                  {product.marca?.nombre ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>

              {/* Badge de estado */}
              <div className="pt-2">
                <Badge
                  variant="outline"
                  className={`w-full justify-center ${
                    product.isComplete
                      ? "border-green-500 text-green-700 bg-green-50"
                      : "border-red-500 text-red-700 bg-red-50"
                  }`}
                >
                  {product.isComplete ? "Producto Completo" : "Producto Incompleto"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No se encontraron productos</h3>
            <p className="text-gray-500">
              {searchTerm || filter !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "No hay productos disponibles"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
