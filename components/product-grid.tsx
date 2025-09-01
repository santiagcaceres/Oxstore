"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/database"

interface ProductGridProps {
  category?: string
  featured?: boolean
  search?: string
  initialProducts?: Product[]
  className?: string
  limit?: number
  sortBy?: string
  filterBrand?: string
  filterColor?: string
  filterSize?: string
}

export function ProductGrid({
  category,
  featured,
  search,
  initialProducts = [],
  className = "",
  limit = 12,
  sortBy = "created_at-desc",
  filterBrand = "",
  filterColor = "",
  filterSize = "",
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  const loadProducts = async (reset = false) => {
    setLoading(true)
    try {
      console.log("[v0] Loading products with params:", {
        category,
        featured,
        search,
        reset,
        offset,
        sortBy,
        filterBrand,
        filterColor,
        filterSize,
      })

      const supabase = createClient()
      let query = supabase.from("products_in_stock").select("*").gt("stock_quantity", 0).eq("is_active", true)

      // Apply category filter
      if (category) {
        query = query.eq("category", category)
      }

      // Apply featured filter
      if (featured) {
        query = query.eq("is_featured", true)
      }

      if (filterBrand) {
        query = query.eq("brand", filterBrand)
      }

      if (filterColor) {
        query = query.ilike("description", `%${filterColor}%`)
      }

      if (filterSize) {
        query = query.ilike("description", `%${filterSize}%`)
      }

      // Apply search filter
      if (search) {
        const searchTerm = search.toLowerCase()
        query = query.or(
          `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,zureo_code.ilike.%${searchTerm}%`,
        )
      }

      const [sortField, sortDirection] = sortBy.split("-")
      const ascending = sortDirection === "asc"

      switch (sortField) {
        case "price":
          query = query.order("price", { ascending })
          break
        case "name":
          query = query.order("name", { ascending })
          break
        default:
          query = query.order("created_at", { ascending: false })
      }

      const currentOffset = reset ? 0 : offset
      const { data: productsData, error } = await query.range(currentOffset, currentOffset + limit - 1)

      if (error) {
        console.error("[v0] Error loading products:", error)
        setProducts([])
        setHasMore(false)
        return
      }

      console.log("[v0] Loaded products from database:", productsData?.length || 0)

      const convertedProducts: Product[] = (productsData || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: `${p.id}-${p.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim()}`,
        description: p.description,
        short_description: p.description?.substring(0, 100) + "...",
        price: p.price,
        compare_price: p.price * 1.2,
        sku: p.zureo_code,
        stock_quantity: p.stock_quantity,
        category_id: 1,
        brand: p.brand,
        is_active: p.is_active,
        is_featured: p.is_featured,
        created_at: p.created_at,
        updated_at: p.updated_at,
        images: [
          {
            id: p.id,
            product_id: p.id,
            image_url: p.image_url || "/placeholder.svg?height=400&width=400",
            alt_text: p.name,
            sort_order: 0,
            is_primary: true,
            created_at: p.created_at,
          },
        ],
      }))

      if (reset) {
        setProducts(convertedProducts)
        setOffset(convertedProducts.length)
      } else {
        setProducts((prev) => [...prev, ...convertedProducts])
        setOffset((prev) => prev + convertedProducts.length)
      }

      setHasMore(convertedProducts.length === limit)
      console.log(
        "[v0] Products state updated:",
        convertedProducts.length,
        "total:",
        reset ? convertedProducts.length : products.length + convertedProducts.length,
      )
    } catch (error) {
      console.error("[v0] Error loading products:", error)
      setProducts([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log("[v0] useEffect triggered with:", {
      category,
      featured,
      search,
      sortBy,
      filterBrand,
      filterColor,
      filterSize,
    })
    setOffset(0)
    loadProducts(true)
  }, [category, featured, search, limit, sortBy, filterBrand, filterColor, filterSize])

  const loadMore = () => {
    loadProducts(false)
  }

  if (products.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontraron productos.</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        className={`grid gap-6 ${
          limit === 5
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        }`}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} className="animate-fade-in-up" />
        ))}

        {loading &&
          Array.from({ length: Math.min(8, limit) }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
      </div>

      {hasMore && !loading && products.length > 0 && limit > 5 && (
        <div className="text-center mt-8">
          <Button onClick={loadMore} variant="outline" size="lg">
            Cargar más productos
          </Button>
        </div>
      )}
    </div>
  )
}
