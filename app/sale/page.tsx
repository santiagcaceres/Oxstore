"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"

export default function SalePage() {
  const [filters, setFilters] = useState({
    sortBy: "price-asc",
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
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">SALE</h1>
          <p className="text-muted-foreground">Productos en oferta con los mejores precios</p>
        </div>

        <ProductFilters onFiltersChange={handleFiltersChange} />

        {/* Grid de productos */}
        <ProductGrid
          sortBy={filters.sortBy}
          filterBrand={getFilterValue(filters.filterBrand, "brands")}
          filterColor={getFilterValue(filters.filterColor, "colors")}
          filterSize={getFilterValue(filters.filterSize, "sizes")}
        />
      </main>

      <Footer />
    </div>
  )
}
