"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface Product {
  id: number
  name: string
  price: number
  sale_price?: number
  discount_percentage?: number
  image_url: string
  slug: string
  brand: string
  gender: string
  category: string
  subcategory?: string
  created_at: string
}

interface PageProps {
  params: {
    slug: string[]
  }
}

export default function CategoryPage({ params }: PageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    sortBy: "price-asc",
    filterBrand: "all-brands",
    filterColor: "all-colors",
    filterSize: "all-sizes",
  })

  const [gender, category, subcategory, subSubcategory] = params.slug

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        // Build query based on URL structure
        let query = supabase.from("products_in_stock").select("*").gt("stock", 0)

        if (gender && gender !== "nuevo") {
          query = query.eq("gender", gender)
        }

        if (category) {
          query = query.eq("category", category)
        }

        if (subcategory) {
          query = query.eq("subcategory", subcategory)
        }

        if (gender === "nuevo") {
          const twentyDaysAgo = new Date()
          twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20)
          query = query.gte("created_at", twentyDaysAgo.toISOString())
        }

        const { data, error } = await query.order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching products:", error)
          return
        }

        setProducts(data || [])
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [gender, category, subcategory, subSubcategory])

  const getFilterValue = (value: string, prefix: string) => {
    return value === `all-${prefix}` ? "" : value
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  // Generate page title
  let title = "Productos"
  if (gender === "nuevo") {
    title = "Productos Nuevos"
  } else if (gender && category && subcategory) {
    title = `${gender.charAt(0).toUpperCase() + gender.slice(1)} - ${category.charAt(0).toUpperCase() + category.slice(1)} - ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}`
  } else if (gender && category) {
    title = `${gender.charAt(0).toUpperCase() + gender.slice(1)} - ${category.charAt(0).toUpperCase() + category.slice(1)}`
  } else if (gender) {
    title = gender.charAt(0).toUpperCase() + gender.slice(1)
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
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground">{products?.length || 0} productos encontrados</p>
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
