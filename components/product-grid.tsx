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
  limit?: number
}

export function ProductGrid({
  category,
  featured,
  search,
  initialProducts = [],
  className = "",
  limit = 12,
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(initialProducts.length)

  const loadProducts = async (reset = false) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/zureo/products`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const convertedProducts: Product[] =
        data.products?.map((zp: any) => ({
          id: zp.id,
          name: zp.nombre,
          slug: zp.nombre
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .trim(),
          description: zp.descripcion_larga || zp.descripcion_corta,
          short_description: zp.descripcion_corta,
          price: zp.precio,
          compare_price: zp.precio * 1.2,
          sku: zp.codigo,
          stock_quantity: zp.stock,
          category_id: 1,
          brand: zp.marca?.nombre || "Oxstore",
          is_active: zp.stock > 0,
          is_featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          images: [
            {
              id: zp.id,
              product_id: zp.id,
              image_url: "/generic-product-display.png",
              alt_text: zp.nombre,
              sort_order: 0,
              is_primary: true,
              created_at: new Date().toISOString(),
            },
          ],
        })) || []

      let filteredProducts = convertedProducts

      if (category) {
        const categoryMap: { [key: string]: string } = {
          mujer: "mujer",
          hombre: "hombre",
        }
        const categoryFilter = categoryMap[category]
        if (categoryFilter) {
          filteredProducts = filteredProducts.filter(
            (p) => p.name.toLowerCase().includes(categoryFilter) || p.brand.toLowerCase().includes(categoryFilter),
          )
        }
      }

      if (featured) {
        filteredProducts = filteredProducts.slice(0, 6) // First 6 as featured
      }

      if (search) {
        const searchTerm = search.toLowerCase()
        filteredProducts = filteredProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm) ||
            p.brand.toLowerCase().includes(searchTerm) ||
            p.sku.toLowerCase().includes(searchTerm),
        )
      }

      const currentOffset = reset ? 0 : offset
      const paginatedProducts = filteredProducts.slice(currentOffset, currentOffset + limit)

      if (reset) {
        setProducts(paginatedProducts)
        setOffset(paginatedProducts.length)
      } else {
        setProducts((prev) => [...prev, ...paginatedProducts])
        setOffset((prev) => prev + paginatedProducts.length)
      }

      setHasMore(currentOffset + limit < filteredProducts.length)
    } catch (error) {
      console.error("Error loading products:", error)
      setProducts([])
      setHasMore(false)
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
