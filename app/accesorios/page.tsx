"use client"

import { useState, useMemo, useEffect } from "react"
import { getProductsFromZureo, getBrandsFromZureo } from "@/lib/zureo-api"
import { transformZureoProduct } from "@/lib/data-transformer"
import ProductGrid from "@/components/product-grid"
import { FilterBar } from "@/components/filter-bar"
import NoProductsFound from "@/components/no-products-found"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import CategoryLoadingScreen from "@/components/category-loading-screen"
import ErrorPage from "@/components/error-page"

export default function AccessoriesPage() {
  const [products, setProducts] = useState<any[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useState<any>({})

  useEffect(() => {
    async function loadProducts() {
      try {
        setError(null)
        const productsData = await getProductsFromZureo({ qty: 1000 })
        const brandsData = await getBrandsFromZureo()

        if (productsData && Array.isArray(productsData)) {
          const allProducts = productsData
            .map((p: any) => {
              try {
                return transformZureoProduct(p)
              } catch (error) {
                console.error("Error transformando producto:", error)
                return null
              }
            })
            .filter(Boolean)

          const accessoryProducts = allProducts.filter(
            (p) =>
              p &&
              p.isActive &&
              (p.category.toLowerCase().includes("accesorio") ||
                p.category.toLowerCase().includes("gorra") ||
                p.category.toLowerCase().includes("cartera") ||
                p.category.toLowerCase().includes("cinturon") ||
                p.category.toLowerCase().includes("joya") ||
                p.category.toLowerCase().includes("reloj") ||
                p.category.toLowerCase().includes("bufanda")),
          )

          setProducts(accessoryProducts)
          setBrands(brandsData?.map((b: any) => b.nombre).filter(Boolean) || [])
        } else {
          setError("No se pudieron cargar los productos")
        }
      } catch (error) {
        console.error("Error cargando productos:", error)
        setError("Error de conexión con el servidor")
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!product) return false

      const brandMatch = searchParams?.brand ? product.brand === searchParams.brand : true
      const minPriceMatch = searchParams?.minPrice
        ? product.price >= Number.parseFloat(searchParams.minPrice as string)
        : true
      const maxPriceMatch = searchParams?.maxPrice
        ? product.price <= Number.parseFloat(searchParams.maxPrice as string)
        : true
      const queryMatch = searchParams?.query
        ? product.title.toLowerCase().includes((searchParams.query as string).toLowerCase()) ||
          product.description.toLowerCase().includes((searchParams.query as string).toLowerCase()) ||
          product.brand.toLowerCase().includes((searchParams.query as string).toLowerCase()) ||
          product.category.toLowerCase().includes((searchParams.query as string).toLowerCase())
        : true

      return brandMatch && minPriceMatch && maxPriceMatch && queryMatch
    })
  }, [products, searchParams])

  if (loading) {
    return <CategoryLoadingScreen category="Accesorios" />
  }

  if (error) {
    return (
      <ErrorPage
        title="Error al cargar accesorios"
        description="No pudimos cargar los accesorios en este momento. Por favor, intenta nuevamente."
        showRetryButton={true}
        showHomeButton={true}
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4 bg-transparent">
              ← Volver al Inicio
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Accesorios</h1>
          <p className="text-gray-600">Completa tu look con nuestros accesorios</p>
        </div>

        <FilterBar brands={brands} onFiltersChange={setSearchParams} />

        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : (
          <NoProductsFound
            title="No hay accesorios disponibles"
            description="No se encontraron accesorios que coincidan con tus filtros. Prueba con diferentes criterios o explora otras categorías."
            showSearchButton={true}
            showHomeButton={true}
          />
        )}
      </div>
    </div>
  )
}
