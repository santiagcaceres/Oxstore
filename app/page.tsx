import HeroSlider from "@/components/hero-slider"
import ProductGrid from "@/components/product-grid"
import BrandCarousel from "@/components/brand-carousel"
import { getAllZureoProducts } from "@/lib/zureo-api"
import { transformZureoProduct } from "@/lib/data-transformer"

export default async function HomePage() {
  try {
    const zureoProducts = await getAllZureoProducts()

    // Filtrar solo productos con marca y stock
    const realProducts = zureoProducts
      .filter((product) => product.marca?.nombre && product.stock > 0 && !product.baja)
      .map(transformZureoProduct)
      .slice(0, 12) // Mostrar solo los primeros 12

    // Obtener marcas únicas
    const brands = Array.from(
      new Set(zureoProducts.filter((product) => product.marca?.nombre).map((product) => product.marca.nombre)),
    )

    return (
      <div className="min-h-screen">
        <HeroSlider />

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-black mb-4">Productos Destacados</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Descubre nuestra selección de productos con las mejores marcas
              </p>
            </div>

            <ProductGrid products={realProducts} />
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-black mb-4">Nuestras Marcas</h2>
              <p className="text-gray-600">Las mejores marcas en un solo lugar</p>
            </div>

            <BrandCarousel brands={brands} />
          </div>
        </section>
      </div>
    )
  } catch (error) {
    console.error("Error loading homepage:", error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Error al cargar la página</h1>
          <p className="text-gray-600">Por favor, intenta nuevamente más tarde</p>
        </div>
      </div>
    )
  }
}
