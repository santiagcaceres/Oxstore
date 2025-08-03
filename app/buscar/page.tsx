import { Suspense } from "react"
import { getProductsFromZureo, getBrandsFromZureo } from "@/lib/zureo-api"
import { transformZureoProduct } from "@/lib/data-transformer"
import ProductGrid from "@/components/product-grid"
import { ProductGridSkeleton } from "@/components/product-grid-skeleton"
import { FilterBar } from "@/components/filter-bar"

export const revalidate = 3600 // Revalidate every hour

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const query = searchParams?.query as string | undefined
  const productsData = await getProductsFromZureo({ qty: 1000 })
  const brandsData = await getBrandsFromZureo()

  const allProducts = productsData.map((p: any) => transformZureoProduct(p))
  const activeProducts = allProducts.filter((p) => p.isActive)

  const brands = brandsData.map((b: any) => b.nombre).filter(Boolean)

  const filteredProducts = activeProducts.filter((product) => {
    const brandMatch = searchParams?.brand ? product.brand === searchParams.brand : true
    const minPriceMatch = searchParams?.minPrice
      ? product.price >= Number.parseFloat(searchParams.minPrice as string)
      : true
    const maxPriceMatch = searchParams?.maxPrice
      ? product.price <= Number.parseFloat(searchParams.maxPrice as string)
      : true
    const queryMatch = query
      ? product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        product.handle.toLowerCase().includes(query.toLowerCase()) // Buscar también por código
      : true

    return brandMatch && minPriceMatch && maxPriceMatch && queryMatch
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
      <h1 className="text-4xl font-bold mb-8 text-center">
        {query ? `Resultados para "${query}"` : "Todos los Productos"}
      </h1>
      <FilterBar brands={brands} />
      <Suspense fallback={<ProductGridSkeleton />}>
        {sortedProducts.length > 0 ? (
          <ProductGrid products={sortedProducts} />
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No se encontraron productos para esta búsqueda o selección.</p>
            <p className="text-md text-gray-500 mt-2">Intenta ajustar tus filtros o buscar otros productos.</p>
          </div>
        )}
      </Suspense>
    </div>
  )
}
