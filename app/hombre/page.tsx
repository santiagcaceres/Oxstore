import { Suspense } from "react"
import { getProductsFromZureo, getBrandsFromZureo } from "@/lib/zureo-api"
import { transformZureoProduct } from "@/lib/data-transformer"
import ProductGrid from "@/components/product-grid"
import { FilterBar } from "@/components/filter-bar"
import NoProductsFound from "@/components/no-products-found"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import CategoryLoadingScreen from "@/components/category-loading-screen"
import ErrorPage from "@/components/error-page"

export const revalidate = 3600 // Revalidate every hour

async function MenProducts({ searchParams }: { searchParams: any }) {
  try {
    const productsData = await getProductsFromZureo({ qty: 1000 })
    const brandsData = await getBrandsFromZureo()

    if (!productsData || !Array.isArray(productsData)) {
      return (
        <ErrorPage
          title="Error al cargar productos de hombre"
          description="No pudimos conectar con nuestro sistema de productos. Por favor, intenta nuevamente en unos momentos."
          showRetryButton={true}
          showHomeButton={true}
        />
      )
    }

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

    const activeProducts = allProducts.filter((p) => p && p.isActive)
    const brands = brandsData?.map((b: any) => b.nombre).filter(Boolean) || []

    const filteredProducts = activeProducts.filter((product) => {
      if (!product) return false

      // Filtrar por género masculino
      const genderMatch = product.gender === "Hombre" || product.gender === "Unisex"
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

      return genderMatch && brandMatch && minPriceMatch && maxPriceMatch && queryMatch
    })

    const sortedProducts = filteredProducts.sort((a, b) => {
      if (searchParams?.sort === "price-asc") {
        return a.price - b.price
      }
      if (searchParams?.sort === "price-desc") {
        return b.price - a.price
      }
      if (searchParams?.sort === "name-asc") {
        return a.title.localeCompare(b.title)
      }
      if (searchParams?.sort === "name-desc") {
        return b.title.localeCompare(a.title)
      }
      return 0
    })

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4 bg-transparent">
              ← Volver al Inicio
            </Button>
          </Link>
        </div>
        <h1 className="text-4xl font-bold mb-8 text-center">Colección Hombre</h1>
        <FilterBar brands={brands} />
        {sortedProducts.length > 0 ? (
          <ProductGrid products={sortedProducts} />
        ) : (
          <NoProductsFound
            title="No hay productos para hombre"
            description="No se encontraron productos masculinos que coincidan con tus filtros. Intenta ajustar los criterios de búsqueda o explora otras categorías."
            showSearchButton={true}
            showHomeButton={true}
          />
        )}
      </div>
    )
  } catch (error) {
    console.error("Error en página de hombre:", error)
    return (
      <ErrorPage
        title="Error al cargar la colección de hombre"
        description="Ocurrió un problema al cargar los productos. Nuestro equipo ha sido notificado y estamos trabajando para solucionarlo."
        showRetryButton={true}
        showHomeButton={true}
      />
    )
  }
}

export default function MenPage({ searchParams }: { searchParams: any }) {
  return (
    <Suspense fallback={<CategoryLoadingScreen category="Hombre" />}>
      <MenProducts searchParams={searchParams} />
    </Suspense>
  )
}
