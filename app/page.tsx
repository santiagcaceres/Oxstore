import Image from "next/image"
import Link from "next/link"
import HeroSlider from "@/components/hero-slider"
import ProductSlider from "@/components/product-slider"
import BrandCarousel from "@/components/brand-carousel"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="pt-16">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Secciones Hombre/Mujer - Más compactas */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sección Hombre */}
            <Link href="/hombre" className="group">
              <div className="relative h-64 overflow-hidden rounded-lg">
                <Image
                  src="/placeholder.svg?height=300&width=600&text=Colección+Hombre"
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

            {/* Sección Mujer */}
            <Link href="/mujer" className="group">
              <div className="relative h-64 overflow-hidden rounded-lg">
                <Image
                  src="/placeholder.svg?height=300&width=600&text=Colección+Mujer"
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

      {/* Carrusel de Marcas - Sin título y más compacto */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <BrandCarousel />
        </div>
      </section>

      {/* Slider de Productos - Sin título */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <ProductSlider />
        </div>
      </section>

      {/* Banner de Anuncios */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <Link href="/promocion" className="block">
            <div className="relative h-32 overflow-hidden rounded-lg">
              <Image
                src="/placeholder.svg?height=150&width=1200&text=Banner+Promocional"
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
