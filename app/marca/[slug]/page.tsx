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
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    sortBy: "price-asc",
    filterBrand: "all-brands",
    filterColor: "all-colors",
    filterSize: "all-sizes",
  })

  useEffect(() => {
    const fetchBrandAndProducts = async () => {
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

        const { data: productsData, error: productsError } = await supabase
          .from("products_in_stock")
          .select("*")
          .eq("brand", brandData.name)
          .gt("stock", 0)
          .order("created_at", { ascending: false })

        if (productsError) {
          console.error("Error fetching brand products:", productsError)
        } else {
          setProducts(productsData || [])
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBrandAndProducts()
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
          <p className="text-muted-foreground">
            Descubre todos los productos de {brand.name} ({products?.length || 0} productos)
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
