"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/shopify"

interface ProductGridProps {
  products: Product[]
  showFilters?: boolean
}

export default function ProductGrid({ products, showFilters = true }: ProductGridProps) {
  const [sortBy, setSortBy] = useState("name")
  const [filterBy, setFilterBy] = useState("all")

  // Obtener categorías únicas para el filtro
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)))

  // Filtrar productos
  const filteredProducts = products.filter((product) => {
    if (filterBy === "all") return true
    return product.category === filterBy
  })

  // Ordenar productos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.title.localeCompare(b.title)
      case "price-low":
        return (
          Number.parseFloat(a.priceRange.minVariantPrice.amount) -
          Number.parseFloat(b.priceRange.minVariantPrice.amount)
        )
      case "price-high":
        return (
          Number.parseFloat(b.priceRange.minVariantPrice.amount) -
          Number.parseFloat(a.priceRange.minVariantPrice.amount)
        )
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No hay productos disponibles</h2>
        <p className="text-gray-600">No se encontraron productos en esta categoría.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nombre A-Z</SelectItem>
                <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                <SelectItem value="newest">Más Recientes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-gray-600">
            {sortedProducts.length} producto{sortedProducts.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedProducts.map((product) => (
          <Link key={product.id} href={`/producto/${product.handle}`} className="group">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={product.featuredImage.url || "/placeholder.svg"}
                  alt={product.featuredImage.altText}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {!product.availableForSale && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Badge variant="secondary" className="bg-red-500 text-white">
                      Agotado
                    </Badge>
                  </div>
                )}
                {product.stock && product.stock < 5 && product.availableForSale && (
                  <Badge className="absolute top-2 right-2 bg-orange-500 text-white">¡Últimas {product.stock}!</Badge>
                )}
              </div>

              <div className="p-4">
                <div className="mb-2">
                  {product.brand && <p className="text-xs text-gray-500 uppercase tracking-wide">{product.brand}</p>}
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-gray-900">
                      ${Number.parseFloat(product.priceRange.minVariantPrice.amount).toLocaleString("es-AR")}
                    </span>
                    {Number.parseFloat(product.priceRange.maxVariantPrice.amount) >
                      Number.parseFloat(product.priceRange.minVariantPrice.amount) && (
                      <span className="text-sm text-gray-500">
                        hasta ${Number.parseFloat(product.priceRange.maxVariantPrice.amount).toLocaleString("es-AR")}
                      </span>
                    )}
                  </div>

                  {product.category && (
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
