"use client"

import { useEffect, useRef } from "react"
import { HeroBanner } from "@/components/hero-banner"
import { CategoryGrid } from "@/components/category-grid"
import { ProductGrid } from "@/components/product-grid"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  const sectionsRef = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up")
            entry.target.classList.remove("opacity-0", "translate-y-8")
          }
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    )

    sectionsRef.current.forEach((section) => {
      if (section) {
        section.classList.add("opacity-0", "translate-y-8", "transition-all", "duration-700")
        observer.observe(section)
      }
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-background page-transition">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-8" ref={(el) => (sectionsRef.current[0] = el)}>
          <HeroBanner />
        </section>

        {/* Categories Section */}
        <section className="container mx-auto px-4 py-12" ref={(el) => (sectionsRef.current[1] = el)}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 animate-fade-in-up stagger-1">Explora Nuestras Categorías</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto animate-fade-in-up stagger-2">
              Descubre la mejor selección de ropa para toda la familia. Calidad, estilo y comodidad en cada prenda.
            </p>
          </div>
          <div className="animate-fade-in-up stagger-3">
            <CategoryGrid />
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="bg-muted/30 py-12 relative overflow-hidden" ref={(el) => (sectionsRef.current[2] = el)}>
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-secondary/10 to-transparent rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          />

          <div className="container mx-auto px-4 relative">
            <div className="flex items-center justify-between mb-8">
              <div className="animate-fade-in-up stagger-1">
                <h2 className="text-3xl font-bold mb-2">Productos Destacados</h2>
                <p className="text-muted-foreground">Los favoritos de nuestros clientes</p>
              </div>
              <Button variant="outline" asChild className="hover-lift animate-fade-in-up stagger-2 bg-transparent">
                <Link href="/productos">Ver todos</Link>
              </Button>
            </div>
            <div className="animate-fade-in-up stagger-3">
              <ProductGrid featured={true} />
            </div>
          </div>
        </section>

        {/* Promotional Banner */}
        <section className="container mx-auto px-4 py-12" ref={(el) => (sectionsRef.current[3] = el)}>
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden hover-glow transition-all duration-500">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-16 h-16 border-2 border-white rounded-full animate-pulse" />
              <div
                className="absolute top-8 right-8 w-12 h-12 border-2 border-white rounded-full animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
              <div
                className="absolute bottom-4 left-1/3 w-8 h-8 border-2 border-white rounded-full animate-pulse"
                style={{ animationDelay: "1s" }}
              />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-bounce-in">¡Ofertas Especiales!</h2>
              <p className="text-lg mb-6 text-white/90 animate-fade-in-up stagger-2">
                Aprovecha nuestras promociones exclusivas. Hasta 50% de descuento en productos seleccionados.
              </p>
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="hover-scale btn-press animate-fade-in-up stagger-3"
              >
                <Link href="/ofertas">Ver Ofertas</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-muted/50 py-12 relative" ref={(el) => (sectionsRef.current[4] = el)}>
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4 animate-fade-in-up stagger-1">Mantente al día</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto animate-fade-in-up stagger-2">
              Suscríbete a nuestro newsletter y recibe las últimas novedades y ofertas exclusivas.
            </p>
            <div className="flex max-w-md mx-auto gap-2 animate-fade-in-up stagger-3">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-4 py-2 rounded-lg border border-input bg-background transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary hover-glow"
              />
              <Button className="btn-press hover-scale">Suscribirse</Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
