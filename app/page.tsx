import Image from "next/image"
import Link from "next/link"
import HeroSlider from "@/components/hero-slider"
import ProductSlider from "@/components/product-slider"
import BrandCarousel from "@/components/brand-carousel"
import { Button } from "@/components/ui/button"
import { getProductsFromZureo, getBrandsFromZureo } from "@/lib/zureo-api"
import { transformZureoProduct } from "@/lib/data-transformer"

export default async function HomePage() {
  let products: any[] = []
  let brands: any[] = []

  try {
    // Obtener datos reales para los componentes
    const rawProducts = await getProductsFromZureo({ qty: 10 })

    if (rawProducts && Array.isArray(rawProducts)) {
      products = rawProducts
        .map((p) => {
          try {
            return transformZureoProduct(p)
          } catch (error) {
            console.error("Error transformando producto:", error)
            return null
          }
        })
        .filter(Boolean)
    }

    const rawBrands = await getBrandsFromZureo()
    if (rawBrands && Array.isArray(rawBrands)) {
      brands = rawBrands
    }
  } catch (error) {
    console.error("Error cargando datos de la página principal:", error)
    // Continuar con arrays vacíos si hay error
  }

  return (
    <div className="pt-16">
      <HeroSlider />

      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/hombre" className="group">
              <div className="relative h-64 overflow-hidden rounded-lg">
                <Image
                  src="/placeholder.svg?height=300&width=600"
                  alt="Colección Hombre"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-3xl font-bold mb-3">HOMBRE</h3>
                    <Button
                      variant="outline"
                      className="text-white border-white hover:bg-white hover:text-black bg-transparent"
                    >
                      Ver Colección
                    </Button>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/mujer" className="group">
              <div className="relative h-64 overflow-hidden rounded-lg">
                <Image
                  src="/placeholder.svg?height=300&width=600"
                  alt="Colección Mujer"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-3xl font-bold mb-3">MUJER</h3>
                    <Button
                      variant="outline"
                      className="text-white border-white hover:bg-white hover:text-black bg-transparent"
                    >
                      Ver Colección
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {brands.length > 0 && (
        <section className="py-6">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Nuestras Marcas</h2>
            <BrandCarousel brands={brands} />
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

      <section className="py-6">
        <div className="container mx-auto px-4">
          <Link href="/ofertas" className="block">
            <div className="relative h-32 overflow-hidden rounded-lg">
              <Image
                src="/placeholder.svg?height=150&width=1200"
                alt="Banner Promocional"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
