import { getProductsFromZureo } from "@/lib/zureo-api"
import { transformZureoProduct } from "@/lib/data-transformer"
import ProductGrid from "@/components/product-grid"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

async function BrandProducts({ brandName }: { brandName: string }) {
  const decodedBrandName = decodeURIComponent(brandName)

  // Obtener todos los productos y filtrar por marca
  const allProducts = await getProductsFromZureo({ qty: 1000 })
  const brandProducts = allProducts.filter(
    (product) => product.marca?.nombre?.toLowerCase() === decodedBrandName.toLowerCase(),
  )

  const transformedProducts = brandProducts.map((product) => transformZureoProduct(product))

  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{decodedBrandName}</h1>
          <p className="text-gray-600">{transformedProducts.length} productos encontrados</p>
        </div>

        {transformedProducts.length > 0 ? (
          <ProductGrid products={transformedProducts} />
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No hay productos disponibles</h2>
            <p className="text-gray-600">
              La marca "{decodedBrandName}" no tiene productos disponibles en este momento.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BrandPage({ params }: { params: { nombre: string } }) {
  return (
    <Suspense
      fallback={
        <div className="pt-16 min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-48 mb-8" />
            <ProductGridSkeleton />
          </div>
        </div>
      }
    >
      <BrandProducts brandName={params.nombre} />
    </Suspense>
  )
}
