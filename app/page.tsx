import HeroSlider from "@/components/hero-slider"
import ProductSlider from "@/components/product-slider"
import BrandCarousel from "@/components/brand-carousel"
import { getProductsFromZureo, getBrandsFromZureo } from "@/lib/zureo-api"
import { transformZureoProduct } from "@/lib/data-transformer"

// Mock de logos de marcas. Esto debería venir de una BBDD.
const brandLogos: { [key: string]: string } = {
  LEVIS: "/placeholder.svg?height=100&width=200&text=LEVIS",
  NIKE: "/placeholder.svg?height=100&width=200&text=NIKE",
  ADIDAS: "/placeholder.svg?height=100&width=200&text=ADIDAS",
}

export default async function HomePage() {
  let products: any[] = []
  let brandsWithLogos: { id: number; nombre: string; imageUrl: string }[] = []

  try {
    const rawProducts = await getProductsFromZureo({ qty: 20 })
    products = rawProducts.filter((p) => p.stock > 0 && !p.baja && p.marca?.nombre).map(transformZureoProduct)

    const rawBrands = await getBrandsFromZureo()
    brandsWithLogos = rawBrands
      .filter((b) => b.nombre && brandLogos[b.nombre.toUpperCase()])
      .map((b) => ({
        ...b,
        imageUrl: brandLogos[b.nombre.toUpperCase()] || "",
      }))
  } catch (error) {
    console.error("Error cargando datos de la página principal:", error)
  }

  return (
    <div className="pt-16">
      <HeroSlider />

      {brandsWithLogos.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Nuestras Marcas</h2>
            <BrandCarousel brands={brandsWithLogos} />
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Productos Destacados</h2>
            <ProductSlider products={products} />
          </div>
        </section>
      )}
    </div>
  )
}
