import HeroSlider from "@/components/hero-slider"
import ProductSlider from "@/components/product-slider"
import BrandCarousel from "@/components/brand-carousel"
import { getProductsFromZureo, getBrandsFromZureo } from "@/lib/zureo-api"
import { transformZureoProduct } from "@/lib/data-transformer"

export default async function HomePage() {
  let featuredProducts = []
  let newProducts = []
  let brands = []

  try {
    // Obtener solo productos activos con marca
    const zureoProducts = await getProductsFromZureo({ qty: 100 })
    const productsWithBrand = zureoProducts.filter(
      (product) =>
        !product.baja &&
        product.marca &&
        product.marca.nombre &&
        product.marca.nombre.trim() !== "" &&
        product.stock > 0,
    )

    featuredProducts = productsWithBrand.slice(0, 8).map(transformZureoProduct)

    newProducts = productsWithBrand.slice(8, 16).map(transformZureoProduct)

    // Obtener solo marcas que tienen productos
    const allBrands = await getBrandsFromZureo()
    const brandsWithProducts = allBrands.filter(
      (brand) =>
        brand.nombre &&
        brand.nombre.trim() !== "" &&
        productsWithBrand.some((product) => product.marca.nombre === brand.nombre),
    )

    brands = brandsWithProducts.slice(0, 12) // Máximo 12 marcas
  } catch (error) {
    console.error("Error loading homepage data:", error)
  }

  return (
    <div className="min-h-screen">
      <HeroSlider />

      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Productos Destacados</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Descubre nuestra selección de productos más populares</p>
            </div>
            <ProductSlider products={featuredProducts} />
          </div>
        </section>
      )}

      {newProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Nuevos Productos</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Las últimas incorporaciones a nuestro catálogo</p>
            </div>
            <ProductSlider products={newProducts} />
          </div>
        </section>
      )}

      {brands.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Nuestras Marcas</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Trabajamos con las mejores marcas del mercado</p>
            </div>
            <BrandCarousel brands={brands} />
          </div>
        </section>
      )}

      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Necesitas ayuda?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Nuestro equipo está aquí para ayudarte con cualquier consulta sobre productos, envíos o devoluciones.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@oxstore.com"
              className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Contactar por Email
            </a>
            <a
              href="tel:+1234567890"
              className="border border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-colors"
            >
              Llamar Ahora
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
