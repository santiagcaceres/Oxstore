import { Suspense } from "react"
import { ProductGrid } from "@/components/product-grid"
import { notFound } from "next/navigation"

interface BrandPageProps {
  params: {
    slug: string
  }
  searchParams: {
    page?: string
  }
}

async function getBrandProducts(slug: string, page = 1) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/zureo/brands/${slug}/products?page=${page}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch brand products")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching brand products:", error)
    return null
  }
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const page = Number.parseInt(searchParams.page || "1")
  const data = await getBrandProducts(params.slug, page)

  if (!data || !data.success) {
    notFound()
  }

  const brandName = params.slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{brandName}</h1>
        <p className="text-muted-foreground">Descubre todos los productos de {brandName}</p>
      </div>

      <Suspense fallback={<div>Cargando productos...</div>}>
        <ProductGrid products={data.products} totalPages={data.totalPages} currentPage={page} />
      </Suspense>
    </div>
  )
}
