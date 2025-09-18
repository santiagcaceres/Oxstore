import { Suspense } from "react"
import { ProductGrid } from "@/components/product-grid"
import { Skeleton } from "@/components/ui/skeleton"
import { notFound } from "next/navigation"

interface PageProps {
  params: {
    gender: string
    subcategory: string
  }
}

export default function SubcategoryPage({ params }: PageProps) {
  const { gender, subcategory } = params

  if (!["mujer", "hombre"].includes(gender)) {
    notFound()
  }

  const subcategoryName = subcategory.charAt(0).toUpperCase() + subcategory.slice(1)
  const genderName = gender.charAt(0).toUpperCase() + gender.slice(1)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <nav className="text-sm text-muted-foreground mb-4">
          <span>Inicio</span> / <span>{genderName}</span> / <span className="text-foreground">{subcategoryName}</span>
        </nav>
        <h1 className="text-3xl font-bold mb-2">
          {subcategoryName} para {genderName}
        </h1>
        <p className="text-muted-foreground">
          Explora nuestra colección de {subcategoryName.toLowerCase()} para {gender}
        </p>
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid
          apiEndpoint={`/api/zureo/products?gender=${gender}&subcategory=${subcategory}&limit=24`}
          emptyMessage={`No hay ${subcategoryName.toLowerCase()} disponibles para ${gender}`}
        />
      </Suspense>
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
