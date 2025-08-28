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
        <section className="w-full px-4" ref={(el) => (sectionsRef.current[0] = el)}>
          <div className="container mx-auto max-w-4xl">
            <HeroBanner />
          </div>
        </section>

        <section className="w-full py-2" ref={(el) => (sectionsRef.current[1] = el)}>
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-none h-32 flex items-center justify-between px-8 text-white relative overflow-hidden">
              <div className="flex items-center gap-6">
                <div className="text-4xl font-bold">🎭</div>
                <div>
                  <h2 className="text-2xl font-bold">Colección Especial</h2>
                  <p className="text-cyan-100">Descubre nuestras prendas exclusivas</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="lg"
                asChild
                className="bg-green-600 hover:bg-green-700 text-white border-0"
              >
                <Link href="/productos">COMPRAR AHORA</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full py-2" ref={(el) => (sectionsRef.current[2] = el)}>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Banner MUJER */}
              <Link
                href="/categoria/mujer"
                className="group relative overflow-hidden aspect-[4/3] bg-cover bg-center"
                style={{
                  backgroundImage: "url('/mujer-elegante-con-ropa-moderna.png')",
                }}
              >
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h3 className="text-5xl font-bold mb-2">MUJER</h3>
                  <p className="text-lg font-medium">VER MÁS</p>
                </div>
              </Link>

              {/* Banner HOMBRE */}
              <Link
                href="/categoria/hombre"
                className="group relative overflow-hidden aspect-[4/3] bg-cover bg-center"
                style={{
                  backgroundImage: "url('/hombre-elegante-con-ropa-moderna.png')",
                }}
              >
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h3 className="text-5xl font-bold mb-2">HOMBRE</h3>
                  <p className="text-lg font-medium">VER MÁS</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full py-8 bg-white" ref={(el) => (sectionsRef.current[3] = el)}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2 text-black">- NUEVA COLECCIÓN -</h2>
            </div>
            <div>
              <ProductGrid featured={true} limit={5} />
            </div>
          </div>
        </section>

        <section className="w-full py-2" ref={(el) => (sectionsRef.current[4] = el)}>
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-32 flex items-center justify-center text-white relative overflow-hidden">
              <div className="text-center">
                <div className="inline-block bg-pink-500 text-white px-4 py-1 rounded-full text-lg font-bold mb-2 transform -rotate-3">
                  MEGA LIQUIDACIÓN
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold">HASTA</span>
                  <span className="text-6xl font-bold">70</span>
                  <span className="text-4xl font-bold">% OFF</span>
                </div>
                <p className="text-lg mt-1">+15% OFF Scotiabank</p>
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
