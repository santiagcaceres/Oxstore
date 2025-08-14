"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Filter, Grid, List, ChevronDown, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CategoryLoadingScreen } from "@/components/category-loading-screen"
import { ErrorPage } from "@/components/error-page"
import { getSaleProducts, type EnhancedProduct } from "@/lib/product-helpers"

type CategoryFilter = "Todos" | string

export default function SalePage() {
  const [products, setProducts] = useState<EnhancedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("Todos")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    fetchSaleProducts()
  }, [])

  const fetchSaleProducts = async () => {
    try {
      setLoading(true)
      const saleProducts = await getSaleProducts()
      setProducts(saleProducts)
      setError(null)
    } catch (err) {
      console.error("Error fetching sale products:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch =
        categoryFilter === "Todos" ||
        product.rubro?.toLowerCase().includes(categoryFilter.toLowerCase()) ||
        product.subrubro?.toLowerCase().includes(categoryFilter.toLowerCase())
      return categoryMatch
    })
  }, [products, categoryFilter])

  const categories = useMemo(() => {
    const cats = [
      ...new Set([...products.map((p) => p.rubro).filter(Boolean), ...products.map((p) => p.subrubro).filter(Boolean)]),
    ]
    return ["Todos", ...cats]
  }, [products])

  if (loading) {
    return <CategoryLoadingScreen category="SALE" />
  }

  if (error) {
    return <ErrorPage title="Error al cargar productos en oferta" message={error} onRetry={fetchSaleProducts} />
  }

  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Volver al Inicio
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SALE</h1>
          <p className="text-gray-600">Productos en oferta con stock disponible</p>
          <div className="mt-4 inline-block bg-red-100 text-red-800 px-4 py-2 rounded-full font-semibold">
            ¡{products.length} productos disponibles!
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b">
          <div className="flex flex-wrap gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  {categoryFilter}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {categories.map((category) => (
                  <DropdownMenuItem key={category} onSelect={() => setCategoryFilter(category)}>
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Contador de productos */}
        <div className="mb-6">
          <p className="text-gray-600">{filteredProducts.length} productos en oferta</p>
        </div>

        {/* Grid de productos */}
        <div
          className={
            viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "space-y-4"
          }
        >
          {filteredProducts.map((product) => (
            <Link href={`/producto/${product.codigo}`} key={product.id} className="group">
              {viewMode === "grid" ? (
                <div className="bg-gray-50 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <div className="relative aspect-square">
                    <Image
                      src={`/placeholder.svg?width=400&height=400&text=${encodeURIComponent(product.nombre || product.descripcion)}`}
                      alt={product.nombre || product.descripcion}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 right-3 bg-red-500 text-white">SALE</Badge>
                    <div className="absolute top-3 left-3 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium">
                      Stock: {product.totalStock}
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-lg text-gray-800 mb-1">
                      {product.nombre || product.descripcion}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {product.brandInfo?.nombre || product.marca?.nombre || "Sin marca"}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      {product.precio_oferta && (
                        <p className="text-red-600 font-bold text-xl">
                          ${product.precio_oferta.toLocaleString("es-UY")} UYU
                        </p>
                      )}
                      <p
                        className={`${product.precio_oferta ? "text-gray-400 line-through text-sm" : "text-gray-900 font-bold text-xl"}`}
                      >
                        ${product.precio.toLocaleString("es-UY")} UYU
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4 hover:shadow-md transition-shadow">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={`/placeholder.svg?width=96&height=96&text=${encodeURIComponent(product.nombre || product.descripcion)}`}
                      alt={product.nombre || product.descripcion}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-1 right-1 bg-red-500 text-white text-xs">SALE</Badge>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">{product.nombre || product.descripcion}</h3>
                    <p className="text-sm text-gray-500">
                      {product.brandInfo?.nombre || product.marca?.nombre || "Sin marca"} • {product.rubro}
                    </p>
                    <p className="text-xs text-gray-400 mb-1">Stock: {product.totalStock} unidades</p>
                    <div className="flex items-center gap-2">
                      {product.precio_oferta && (
                        <p className="text-red-600 font-bold text-xl">
                          ${product.precio_oferta.toLocaleString("es-UY")} UYU
                        </p>
                      )}
                      <p
                        className={`${product.precio_oferta ? "text-gray-400 line-through" : "text-gray-900 font-bold text-xl"}`}
                      >
                        ${product.precio.toLocaleString("es-UY")} UYU
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay productos en oferta</h3>
            <p className="text-gray-600">
              {categoryFilter !== "Todos"
                ? "No se encontraron productos en oferta para esta categoría."
                : "No hay productos en oferta disponibles en este momento."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
