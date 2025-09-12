"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/database"

interface ProductGridProps {
  category?: string
  subcategory?: string
  gender?: string
  featured?: boolean
  search?: string
  initialProducts?: Product[]
  className?: string
  limit?: number
  sortBy?: string
  filterBrand?: string
  filterColor?: string
  filterSize?: string
  isNew?: boolean
  onSale?: boolean
}

export function ProductGrid({
  category,
  subcategory,
  gender,
  featured,
  search,
  initialProducts = [],
  className = "",
  limit = 12,
  sortBy = "created_at-desc",
  filterBrand = "",
  filterColor = "",
  filterSize = "",
  isNew = false,
  onSale = false,
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
        subcategory,
        gender,
        featured,
        search,
        reset,
        offset,
        sortBy,
        filterBrand,
        filterColor,
        filterSize,
        isNew,
        onSale,
      })

      const supabase = createClient()
      let query = supabase.from("products_in_stock").select("*").gt("stock_quantity", 0).eq("is_active", true)

      if (gender && gender !== "unisex") {
        query = query.or(`gender.eq.${gender},gender.eq.unisex`)
      }

      if (category) {
        query = query.eq("category", category)
      }

      if (subcategory) {
        query = query.eq("subcategory", subcategory)
      }

      // Apply featured filter
      if (featured) {
        query = query.eq("is_featured", true)
      }

      if (isNew) {
        const twentyDaysAgo = new Date()
        twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20)
        query = query.gte("created_at", twentyDaysAgo.toISOString())
      }

      if (onSale) {
        query = query.not("sale_price", "is", null).gt("discount_percentage", 0)
      }

      if (filterBrand && filterBrand !== "all-brands") {
        query = query.eq("brand", filterBrand)
      }

      if (filterColor && filterColor !== "all-colors") {
        query = query.eq("color", filterColor)
      }

      if (filterSize && filterSize !== "all-sizes") {
        query = query.eq("size", filterSize)
      }

      // Apply search filter
      if (search) {
        const searchTerm = search.toLowerCase()
        query = query.or(
          `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,zureo_code.ilike.%${searchTerm}%`,
        )
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

      const convertedProducts: Product[] = []

      for (const p of productsData || []) {
        // Cargar variantes del mismo zureo_code para obtener todos los talles
        const { data: variants } = await supabase
          .from("products_in_stock")
          .select("id, color, size, stock_quantity, price")
          .eq("zureo_code", p.zureo_code)
          .gt("stock_quantity", 0)

        const product: Product & { variants?: any[] } = {
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
          size: p.size, // Talle del producto principal
          variants: variants || [], // Todas las variantes con sus talles
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
        }

        convertedProducts.push(product)
      }

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
      subcategory,
      gender,
      featured,
      search,
      sortBy,
      filterBrand,
      filterColor,
      filterSize,
      isNew,
      onSale,
    })
    setOffset(0)
    loadProducts(true)
  }, [
    category,
    subcategory,
    gender,
    featured,
    search,
    limit,
    sortBy,
    filterBrand,
    filterColor,
    filterSize,
    isNew,
    onSale,
  ])

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
