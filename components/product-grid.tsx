"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Filter, Grid, List, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import type { TransformedProduct } from "@/lib/data-transformer"

interface ProductGridProps {
  products: TransformedProduct[]
  showFilters?: boolean
}

type CategoryFilter = "Todos" | string
type SortOption = "Relevancia" | "Precio: Menor a Mayor" | "Precio: Mayor a Menor" | "Más Nuevos"

export default function ProductGrid({ products = [], showFilters = true }: ProductGridProps) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("Todos")
  const [brandFilter, setBrandFilter] = useState<string>("Todas")
  const [sortBy, setSortBy] = useState<SortOption>("Relevancia")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Obtener categorías y marcas únicas de manera segura
  const categories = useMemo(() => {
    const cats = new Set<string>()
    products.forEach((product) => {
      if (product && product.category) {
        cats.add(product.category)
      }
    })
    return ["Todos", ...Array.from(cats)]
  }, [products])

  const brands = useMemo(() => {
    const brandSet = new Set<string>()
    products.forEach((product) => {
      if (product && product.brand) {
        brandSet.add(product.brand)
      }
    })
    return ["Todas", ...Array.from(brandSet)]
  }, [products])

  const filteredAndSortedProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return []

    const filtered = products.filter((product) => {
      if (!product) return false

      const categoryMatch = categoryFilter === "Todos" || product.category === categoryFilter
      const brandMatch = brandFilter === "Todas" || product.brand === brandFilter
      const isActive = product.isActive !== false // Incluir productos activos

      return categoryMatch && brandMatch && isActive
    })

    switch (sortBy) {
      case "Precio: Menor a Mayor":
        filtered.sort((a, b) => (a?.price || 0) - (b?.price || 0))
        break
      case "Precio: Mayor a Menor":
        filtered.sort((a, b) => (b?.price || 0) - (a?.price || 0))
        break
      case "Más Nuevos":
        // Como no tenemos fecha, ordenamos por ID (asumiendo que IDs más altos = más nuevos)
        filtered.sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))
        break
      default:
        break
    }

    return filtered
  }, [products, categoryFilter, brandFilter, sortBy])

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No hay productos disponibles</h2>
        <p className="text-gray-600">Los productos se están cargando o no hay productos activos.</p>
      </div>
    )
  }

  return (
    <div>
      {showFilters && (
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Marca: {brandFilter}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {brands.map((brand) => (
                  <DropdownMenuItem key={brand} onSelect={() => setBrandFilter(brand)}>
                    {brand}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Ordenar: {sortBy}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(["Relevancia", "Precio: Menor a Mayor", "Precio: Mayor a Menor", "Más Nuevos"] as SortOption[]).map(
                  (option) => (
                    <DropdownMenuItem key={option} onSelect={() => setSortBy(option)}>
                      {option}
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>

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
        </div>
      )}

      <div className="mb-6">
        <p className="text-gray-600">{filteredAndSortedProducts.length} productos encontrados</p>
      </div>

      <div
        className={
          viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "space-y-4"
        }
      >
        {filteredAndSortedProducts.map((product) => {
          if (!product) return null

          return (
            <Link key={product.id} href={`/producto/${product.handle}`} className="group">
              {viewMode === "grid" ? (
                <div className="bg-gray-50 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <div className="relative aspect-square">
                    <Image
                      src={product.images?.[0] || "/placeholder.svg?height=400&width=400&text=Sin+Imagen"}
                      alt={product.title || "Producto"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {!product.inStock && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white">Sin Stock</Badge>
                    )}
                    {product.isActive === false && (
                      <Badge className="absolute top-3 right-3 bg-gray-500 text-white">Inactivo</Badge>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-lg text-gray-800 mb-1">{product.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {product.brand} • {product.category}
                    </p>
                    <p className="text-blue-950 font-bold text-xl">${product.price}</p>
                    {product.stock > 0 && <p className="text-sm text-green-600 mt-1">Stock: {product.stock}</p>}
                  </div>
                </div>
              ) : (
                <Card className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                  <div className="relative w-full h-60 bg-gray-100 overflow-hidden">
                    <Image
                      src={product.images[0] || "/placeholder.svg?height=400&width=400&text=Sin+Imagen"}
                      alt={product.title}
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      priority={false} // Set to false for products not in the first view
                    />
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">AGOTADO</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{product.brand}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xl font-bold text-blue-950">${product.price.toFixed(2)}</span>
                      {product.compareAtPrice && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ${product.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </Link>
          )
        })}
      </div>

      {filteredAndSortedProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron productos con los filtros seleccionados.</p>
          <Button
            onClick={() => {
              setCategoryFilter("Todos")
              setBrandFilter("Todas")
            }}
            className="mt-4 bg-blue-950 hover:bg-blue-900"
          >
            Limpiar Filtros
          </Button>
        </div>
      )}
    </div>
  )
}
