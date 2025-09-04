"use client"

import { useState, useEffect } from "react"
import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createBrowserClient } from "@supabase/ssr"

export default function NuevoPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    sortBy: "price-asc",
    filterBrand: "all-brands",
    filterColor: "all-colors",
    filterSize: "all-sizes",
  })

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        const twentyDaysAgo = new Date()
        twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20)

        const { data, error } = await supabase
          .from("products_in_stock")
          .select("*")
          .gt("stock", 0)
          .gte("created_at", twentyDaysAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(24)

        if (error) {
          console.error("Error fetching new products:", error)
        } else {
          setProducts(data || [])
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNewProducts()
  }, [])

  const getFilterValue = (value: string, prefix: string) => {
    return value === `all-${prefix}` ? "" : value
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando productos...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Productos Nuevos</h1>
          <p className="text-muted-foreground">
            Descubre las últimas incorporaciones a nuestro catálogo ({products?.length || 0} productos)
          </p>
        </div>

        <ProductFilters onFiltersChange={handleFiltersChange} />

        <ProductGrid
          products={products}
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
