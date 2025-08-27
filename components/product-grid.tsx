"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { Product } from "@/lib/database"

interface ProductGridProps {
  category?: string
  featured?: boolean
  search?: string
  initialProducts?: Product[]
  className?: string
}

export function ProductGrid({ category, featured, search, initialProducts = [], className = "" }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(initialProducts.length)

  const loadProducts = async (reset = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category) params.set("category", category)
      if (featured) params.set("featured", "true")
      if (search) params.set("search", search)
      params.set("limit", "12")
      params.set("offset", reset ? "0" : offset.toString())

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()

      if (reset) {
        setProducts(data.products)
        setOffset(data.products.length)
      } else {
        setProducts((prev) => [...prev, ...data.products])
        setOffset((prev) => prev + data.products.length)
      }

      setHasMore(data.products.length === 12)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialProducts.length === 0) {
      loadProducts(true)
    }
  }, [category, featured, search])

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} className="animate-fade-in-up" />
        ))}

        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: 8 }).map((_, i) => (
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

      {/* Load More Button */}
      {hasMore && !loading && products.length > 0 && (
        <div className="text-center mt-8">
          <Button onClick={loadMore} variant="outline" size="lg">
            Cargar más productos
          </Button>
        </div>
      )}
    </div>
  )
}
