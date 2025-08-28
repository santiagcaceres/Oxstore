"use client"

import { useEffect, useRef } from "react"
import { HeroBanner } from "@/components/hero-banner"
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
        <section className="w-full" ref={(el) => (sectionsRef.current[0] = el)}>
          <HeroBanner />
        </section>

        <section className="w-full py-4" ref={(el) => (sectionsRef.current[1] = el)}>
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl p-8 text-center text-white relative overflow-hidden hover-glow transition-all duration-500">
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Colección Especial</h2>
                <p className="text-lg mb-4 text-white/90">Descubre nuestras prendas exclusivas</p>
                <Button variant="secondary" size="lg" asChild className="hover-scale">
                  <Link href="/productos">Comprar Ahora</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-4" ref={(el) => (sectionsRef.current[2] = el)}>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Banner MUJER */}
              <Link
                href="/categoria/mujer"
                className="group relative overflow-hidden rounded-2xl aspect-[4/3] hover-scale"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/80 to-rose-600/80 z-10" />
                <img
                  src="/mujer-elegante-con-ropa-moderna.png"
                  alt="Mujer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white">
                  <h3 className="text-4xl font-bold mb-2">MUJER</h3>
                  <p className="text-lg opacity-90">VER MÁS</p>
                </div>
              </Link>

              {/* Banner HOMBRE */}
              <Link
                href="/categoria/hombre"
                className="group relative overflow-hidden rounded-2xl aspect-[4/3] hover-scale"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-indigo-700/80 z-10" />
                <img
                  src="/hombre-elegante-con-ropa-moderna.png"
                  alt="Hombre"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white">
                  <h3 className="text-4xl font-bold mb-2">HOMBRE</h3>
                  <p className="text-lg opacity-90">VER MÁS</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full py-12 bg-muted/30" ref={(el) => (sectionsRef.current[3] = el)}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2 animate-fade-in-up">- NUEVA COLECCIÓN -</h2>
            </div>
            <div className="animate-fade-in-up">
              <ProductGrid featured={true} limit={5} />
            </div>
          </div>
        </section>

        <section className="w-full py-4" ref={(el) => (sectionsRef.current[4] = el)}>
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-8 text-center text-white relative overflow-hidden hover-glow transition-all duration-500">
              <div className="relative z-10">
                <div className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full text-xl font-bold mb-4 transform -rotate-3">
                  MEGA LIQUIDACIÓN
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-2">HASTA 70% OFF</h2>
                <p className="text-lg mb-6 text-white/90">+15% OFF con tarjetas seleccionadas</p>
                <Button variant="secondary" size="lg" asChild className="hover-scale btn-press">
                  <Link href="/ofertas">Ver Ofertas</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-muted/50 py-12 relative" ref={(el) => (sectionsRef.current[5] = el)}>
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
