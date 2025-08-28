import { Suspense } from "react"
import { ProductGrid } from "@/components/product-grid"
import { Skeleton } from "@/components/ui/skeleton"

export default function NuevoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Productos Nuevos</h1>
        <p className="text-muted-foreground">Descubre las últimas incorporaciones a nuestro catálogo</p>
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid
          apiEndpoint="/api/zureo/products?nuevo=true&limit=24"
          emptyMessage="No hay productos nuevos disponibles"
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
