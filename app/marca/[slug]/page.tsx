"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface BrandPageProps {
  params: {
    slug: string
  }
}

export default function BrandPage({ params }: BrandPageProps) {
  const [brand, setBrand] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    sortBy: "created_at-desc",
    filterBrand: "all-brands",
    filterColor: "all-colors",
    filterSize: "all-sizes",
  })

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        const { data: brandData, error: brandError } = await supabase
          .from("brands")
          .select("*")
          .eq("slug", params.slug)
          .single()

        if (brandError || !brandData) {
          notFound()
          return
        }

        setBrand(brandData)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBrand()
  }, [params.slug])

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

  if (!brand) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{brand.name}</h1>
          <p className="text-muted-foreground">Descubre todos los productos de {brand.name}</p>
        </div>

        <ProductFilters onFiltersChange={handleFiltersChange} hideBrandFilter={true} />

        <ProductGrid
          sortBy={filters.sortBy}
          filterBrand={brand.name}
          filterColor={getFilterValue(filters.filterColor, "colors")}
          filterSize={getFilterValue(filters.filterSize, "sizes")}
          category=""
          subcategory=""
          gender=""
        />
      </main>

      <Footer />
    </div>
  )
}
