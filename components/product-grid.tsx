"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Filter, Grid, List, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { TransformedProduct } from "@/lib/data-transformer"

type SortOption = "Relevancia" | "Precio: Menor a Mayor" | "Precio: Mayor a Menor" | "Alfabético A-Z" | "Alfabético Z-A"

interface ProductGridProps {
  products: TransformedProduct[]
  showFilters?: boolean
}

export default function ProductGrid({ products, showFilters = true }: ProductGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>("Relevancia")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [brandFilter, setBrandFilter] = useState<string>("Todas")
  const [categoryFilter, setCategoryFilter] = useState<string>("Todas")

  // Obtener marcas y categorías únicas
  const uniqueBrands = useMemo(() => {
    const brands = new Set(products.map((p) => p.brand))
    return Array.from(brands).filter(Boolean).sort()
  }, [products])

  const uniqueCategories = useMemo(() => {
    const categories = new Set(products.map((p) => p.category))
    return Array.from(categories).filter(Boolean).sort()
  }, [products])

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const brandMatch = brandFilter === "Todas" || product.brand === brandFilter
      const categoryMatch = categoryFilter === "Todas" || product.category === categoryFilter
      return brandMatch && categoryMatch
    })

    // Ordenar productos
    switch (sortBy) {
      case "Precio: Menor a Mayor":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "Precio: Mayor a Menor":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "Alfabético A-Z":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "Alfabético Z-A":
        filtered.sort((a, b) => b.title.localeCompare(a.title))
        break
      default:
        // Relevancia - mantener orden original
        break
    }

    return filtered
  }, [products, brandFilter, categoryFilter, sortBy])

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No hay productos disponibles</h2>
        <p className="text-gray-600">Falta configurar productos en Zureo API.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros y controles */}
      {showFilters && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
          <div className="flex flex-wrap gap-4">
            {/* Filtro de marca */}
            {uniqueBrands.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Filter className="h-4 w-4" />
                    Marca: {brandFilter}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setBrandFilter("Todas")}>Todas</DropdownMenuItem>
                  {uniqueBrands.map((brand) => (
                    <DropdownMenuItem key={brand} onSelect={() => setBrandFilter(brand)}>
                      {brand}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Filtro de categoría */}
            {uniqueCategories.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    Categoría: {categoryFilter}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setCategoryFilter("Todas")}>Todas</DropdownMenuItem>
                  {uniqueCategories.map((category) => (
                    <DropdownMenuItem key={category} onSelect={() => setCategoryFilter(category)}>
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Ordenar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Ordenar: {sortBy}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(
                  [
                    "Relevancia",
                    "Precio: Menor a Mayor",
                    "Precio: Mayor a Menor",
                    "Alfabético A-Z",
                    "Alfabético Z-A",
                  ] as SortOption[]
                ).map((option) => (
                  <DropdownMenuItem key={option} onSelect={() => setSortBy(option)}>
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Vista */}
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

      {/* Contador de productos */}
      <div className="mb-6">
        <p className="text-gray-600">{filteredAndSortedProducts.length} productos encontrados</p>
      </div>

      {/* Grid de productos */}
      <div
        className={
          viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "space-y-4"
        }
      >
        {filteredAndSortedProducts.map((product) => (
          <Link href={`/producto/${product.handle}`} key={product.id} className="group">
            {viewMode === "grid" ? (
              <div className="bg-gray-50 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                <div className="relative aspect-square">
                  <Image
                    src={product.images[0] || "/placeholder.svg?height=400&width=400&text=Producto"}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized={product.images[0]?.startsWith("data:image")}
                  />
                  {!product.inStock && (
                    <Badge variant="destructive" className="absolute top-3 right-3">
                      Agotado
                    </Badge>
                  )}
                  {product.compareAtPrice && (
                    <Badge className="absolute top-3 left-3 bg-red-100 text-red-800">
                      -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                    </Badge>
                  )}
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-lg text-gray-800 mb-1 truncate">{product.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-blue-950 font-bold text-xl">${product.price}</p>
                    {product.compareAtPrice && (
                      <p className="text-gray-500 line-through text-sm">${product.compareAtPrice}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4 hover:shadow-md transition-shadow">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={product.images[0] || "/placeholder.svg?height=100&width=100&text=Producto"}
                    alt={product.title}
                    fill
                    className="object-cover"
                    unoptimized={product.images[0]?.startsWith("data:image")}
                  />
                  {!product.inStock && (
                    <Badge variant="destructive" className="absolute top-1 right-1 text-xs">
                      Agotado
                    </Badge>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">{product.title}</h3>
                  <p className="text-sm text-gray-500">
                    {product.brand} • {product.category}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-blue-950 font-bold text-xl">${product.price}</p>
                    {product.compareAtPrice && (
                      <p className="text-gray-500 line-through text-sm">${product.compareAtPrice}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Mensaje si no hay productos */}
      {filteredAndSortedProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron productos con los filtros seleccionados.</p>
          <Button
            onClick={() => {
              setBrandFilter("Todas")
              setCategoryFilter("Todas")
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
