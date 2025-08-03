import { getProductByCode, getProductImages } from "@/lib/zureo-api"
import { transformZureoProduct } from "@/lib/data-transformer"
import ProductClientPage from "./product-client-page"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

function ProductPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="aspect-square w-full" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  )
}

async function ProductData({ handle }: { handle: string }) {
  const productData = await getProductByCode(handle)

  if (!productData) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Producto no encontrado</h1>
        <p className="text-gray-600">El producto con el código "{handle}" no existe.</p>
      </div>
    )
  }

  const imageData = await getProductImages(String(productData.id))
  const transformedProduct = transformZureoProduct(productData, imageData)

  return <ProductClientPage product={transformedProduct} />
}

export default function Page({ params }: { params: { handle: string } }) {
  return (
    <Suspense fallback={<ProductPageSkeleton />}>
      <ProductData handle={params.handle} />
    </Suspense>
  )
}
