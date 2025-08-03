"use client"
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

async function WomenProducts() {
  // Obtener todos los productos y filtrar por categorías femeninas
  const allProducts = await getProductsFromZureo({ qty: 1000 })

  // Filtrar productos que podrían ser para mujer
  const womenProducts = allProducts.filter((product) => {
    const category = product.tipo?.nombre?.toLowerCase() || ""
    const name = product.nombre?.toLowerCase() || ""

    // Palabras clave que indican productos femeninos
    const womenKeywords = [
      "mujer",
      "femenino",
      "women",
      "dama",
      "vestido",
      "falda",
      "blusa",
      "top",
      "cartera",
      "bolso",
      "zapatos",
      "sandalias",
    ]

    return womenKeywords.some((keyword) => category.includes(keyword) || name.includes(keyword))
  })

  const transformedProducts = womenProducts.map((product) => transformZureoProduct(product))

  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mujer</h1>
          <p className="text-gray-600">Descubre nuestra colección para mujer</p>
        </div>

        {transformedProducts.length > 0 ? (
          <ProductGrid products={transformedProducts} />
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No hay productos disponibles</h2>
            <p className="text-gray-600">Falta configurar productos para mujer en Zureo API.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function WomenPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-16 min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96 mb-8" />
            <ProductGridSkeleton />
          </div>
        </div>
      }
    >
      <WomenProducts />
    </Suspense>
  )
}
