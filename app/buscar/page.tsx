import { getProductsFromZureo } from "@/lib/zureo-api"
import { transformZureoProduct } from "@/lib/data-transformer"
import ProductGrid from "@/components/product-grid"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

function SearchResultsSkeleton() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-6 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

async function SearchResults({ query }: { query: string }) {
  // Obtener todos los productos y filtrar por búsqueda
  const allProducts = await getProductsFromZureo({ qty: 1000 })

  const searchResults = allProducts.filter((product) => {
    const searchTerm = query.toLowerCase()
    return (
      product.nombre?.toLowerCase().includes(searchTerm) ||
      product.descripcion_larga?.toLowerCase().includes(searchTerm) ||
      product.marca?.nombre?.toLowerCase().includes(searchTerm) ||
      product.tipo?.nombre?.toLowerCase().includes(searchTerm) ||
      product.codigo?.toLowerCase().includes(searchTerm)
    )
  })

  const transformedProducts = searchResults.map((product) => transformZureoProduct(product))

  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Resultados para "{query}"</h1>
          <p className="text-gray-600">{transformedProducts.length} productos encontrados</p>
        </div>

        {transformedProducts.length > 0 ? (
          <ProductGrid products={transformedProducts} />
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No se encontraron productos</h2>
            <p className="text-gray-600 mb-6">No hay productos que coincidan con tu búsqueda "{query}".</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>Sugerencias:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Verifica la ortografía de las palabras</li>
                <li>Usa términos más generales</li>
                <li>Prueba con sinónimos</li>
                <li>Busca por marca o categoría</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || ""

  if (!query) {
    return (
      <div className="pt-16 min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Búsqueda vacía</h1>
            <p className="text-gray-600">Por favor, ingresa un término de búsqueda.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<SearchResultsSkeleton />}>
      <SearchResults query={query} />
    </Suspense>
  )
}
