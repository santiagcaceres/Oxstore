"use client"

import { useState } from "react"
import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { Footer } from "@/components/footer"

export default function NuevoPage() {
  const [filters, setFilters] = useState({
    sortBy: "created_at-desc", // Ordenar por más recientes por defecto
    filterBrand: "all-brands",
    filterColor: "all-colors",
    filterSize: "all-sizes",
  })

  const getFilterValue = (value: string, prefix: string) => {
    return value === `all-${prefix}` ? "" : value
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Productos Nuevos</h1>
          <p className="text-muted-foreground">Descubre las últimas incorporaciones a nuestro catálogo</p>
        </div>

        <ProductFilters onFiltersChange={handleFiltersChange} />

        <ProductGrid
          isNew={true}
          sortBy={filters.sortBy}
          filterBrand={getFilterValue(filters.filterBrand, "brands")}
          filterColor={getFilterValue(filters.filterColor, "colors")}
          filterSize={getFilterValue(filters.filterSize, "sizes")}
          limit={15}
        />
      </main>

      <Footer />
    </div>
  )
}
