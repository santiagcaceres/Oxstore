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
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    sortBy: "created_at-desc",
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

        let query = supabase
          .from("products_in_stock")
          .select("*")
          .gt("stock_quantity", 0)
          .eq("is_active", true)
          // Solo mostrar productos con información completa
          .not("category", "is", null)
          .not("brand", "is", null)
          .not("gender", "is", null)

        if (gender && gender !== "nuevo") {
          if (gender === "unisex") {
            query = query.eq("gender", "unisex")
          } else {
            query = query.or(`gender.eq.${gender},gender.eq.unisex`)
          }
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
          <p className="text-muted-foreground">Explora nuestra selección de productos</p>
        </div>

        <ProductFilters onFiltersChange={handleFiltersChange} />

        <ProductGrid
          products={products}
          gender={gender === "nuevo" ? undefined : gender}
          category={category}
          subcategory={subcategory}
          isNew={gender === "nuevo"}
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
