import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Ofertas</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-4xl font-bold">Ofertas Especiales</h1>
            <Badge variant="destructive" className="text-sm">
              ¡Tiempo Limitado!
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Aprovecha nuestras increíbles ofertas y descuentos exclusivos. ¡No te pierdas estas oportunidades únicas!
          </p>
        </div>

        {/* Promotional Banner */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-8 text-center text-white mb-12">
          <h2 className="text-3xl font-bold mb-4">🔥 3x2 en Toda la Tienda</h2>
          <p className="text-lg mb-4">Lleva 3 productos y paga solo 2. Válido en todos los artículos de la tienda.</p>
          <p className="text-sm text-white/80">
            *Oferta válida hasta agotar stock. Se aplica descuento en el producto de menor valor.
          </p>
        </div>

        {/* Featured Offers */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Productos en Oferta</h2>
          <ProductGrid featured={true} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
