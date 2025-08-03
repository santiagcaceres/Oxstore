import { getProductsFromZureo, getBrandsFromZureo } from "@/lib/zureo-api"
import { transformZureoProduct } from "@/lib/data-transformer"
import ProductGrid from "@/components/product-grid"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { notFound } from "next/navigation"

function BrandPageSkeleton() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-2" />
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

async function BrandData({ nombre }: { nombre: string }) {
  try {
    // Decodificar el nombre de la marca
    const brandName = decodeURIComponent(nombre)

    // Obtener todas las marcas para verificar que existe
    const brands = await getBrandsFromZureo()
    const brand = brands?.find((b: any) => b.nombre?.toLowerCase() === brandName.toLowerCase())

    if (!brand) {
      notFound()
    }

    // Obtener todos los productos
    const allProducts = await getProductsFromZureo({ qty: 1000 })

    // Filtrar productos por marca
    const brandProducts =
      allProducts?.filter((product: any) => product.marca?.nombre?.toLowerCase() === brandName.toLowerCase()) || []

    // Transformar productos
    const transformedProducts = brandProducts
      .map((product: any) => {
        try {
          return transformZureoProduct(product)
        } catch (error) {
          console.error("Error transformando producto:", error)
          return null
        }
      })
      .filter(Boolean)

    return (
      <div className="pt-16 min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{brand.nombre}</h1>
            <p className="text-gray-600">{transformedProducts.length} productos disponibles</p>
          </div>

          {transformedProducts.length > 0 ? (
            <ProductGrid products={transformedProducts} />
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No hay productos disponibles</h2>
              <p className="text-gray-600">Esta marca no tiene productos disponibles en este momento.</p>
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error cargando marca:", error)
    return (
      <div className="pt-16 min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error cargando marca</h1>
            <p className="text-gray-600">Hubo un problema cargando los productos de esta marca.</p>
          </div>
        </div>
      </div>
    )
  }
}

export default function BrandPage({ params }: { params: { nombre: string } }) {
  return (
    <Suspense fallback={<BrandPageSkeleton />}>
      <BrandData nombre={params.nombre} />
    </Suspense>
  )
}
