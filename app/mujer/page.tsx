import { Suspense } from "react"
import { getProductsFromZureo, getBrandsFromZureo } from "@/lib/zureo-api"
import { transformZureoProduct } from "@/lib/data-transformer"
import ProductGrid from "@/components/product-grid"
import { ProductGridSkeleton } from "@/components/product-grid-skeleton"
import { FilterBar } from "@/components/filter-bar"

export const revalidate = 3600 // Revalidate every hour

async function WomenProducts({ searchParams }: { searchParams: any }) {
  try {
    const productsData = await getProductsFromZureo({ qty: 1000 })
    const brandsData = await getBrandsFromZureo()

    if (!productsData || !Array.isArray(productsData)) {
      return (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Error al cargar productos.</p>
        </div>
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

      // Filtrar por género femenino
      const genderMatch = product.gender === "Mujer" || product.gender === "Unisex"
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
        <h1 className="text-4xl font-bold mb-8 text-center">Colección Mujer</h1>
        <FilterBar brands={brands} />
        {sortedProducts.length > 0 ? (
          <ProductGrid products={sortedProducts} />
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No se encontraron productos para mujer.</p>
            <p className="text-md text-gray-500 mt-2">Intenta ajustar tus filtros o buscar otros productos.</p>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error("Error en página de mujer:", error)
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Error al cargar la página.</p>
      </div>
    )
  }
}

export default function WomenPage({ searchParams }: { searchParams: any }) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="h-10 w-64 bg-gray-200 rounded mb-8 mx-auto" />
          <ProductGridSkeleton />
        </div>
      }
    >
      <WomenProducts searchParams={searchParams} />
    </Suspense>
  )
}
