"use client"

import { useEffect, useRef, useState } from "react"
import { HeroBanner } from "@/components/hero-banner"
import { ProductGrid } from "@/components/product-grid"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Banner {
  id: number
  title: string
  subtitle: string
  description: string
  image_url: string
  link_url: string
  position: string | number
  is_active: boolean
}

interface Popup {
  id: number
  title: string
  content: string
  image_url: string
  link_url: string
  is_active: boolean
  show_delay: number
}

export default function HomePage() {
  const sectionsRef = useRef<(HTMLElement | null)[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [popup, setPopup] = useState<Popup | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadBanners = async () => {
    try {
      const supabase = createClient()
      const { data: bannersData, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("position", { ascending: true })

      if (error) {
        console.error("Error loading banners:", error)
        return
      }

      console.log("[v0] Total banners cargados:", bannersData?.length || 0)
      console.log("[v0] Banners data:", bannersData)

      setBanners(bannersData || [])
    } catch (error) {
      console.error("Error loading banners:", error)
    }
  }

  const loadPopup = async () => {
    try {
      const supabase = createClient()
      const { data: popupData, error } = await supabase
        .from("popups")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading popup:", error)
        return
      }

      if (popupData) {
        setPopup(popupData)
        setTimeout(() => setShowPopup(true), popupData.show_delay || 5000)
      }
    } catch (error) {
      console.error("Error loading popup:", error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadBanners(), loadPopup()])
      setLoading(false)
    }
    loadData()

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

  const getSlides = () => {
    const slides = banners.filter((b) => b.position === "hero" && b.is_active)
    console.log("[v0] Slides principales encontrados:", slides.length, slides)
    return slides
  }

  const getCategoryBanners = () => {
    const categoryBanners = banners.filter((b) => b.position.toString().startsWith("category-") && b.is_active)
    console.log("[v0] Banners de categoría encontrados:", categoryBanners.length, categoryBanners)
    return categoryBanners
  }

  const getGenderBanners = () => {
    const genderBanners = banners.filter((b) => b.position.toString().startsWith("gender-") && b.is_active)
    console.log("[v0] Banners de género encontrados:", genderBanners.length, genderBanners)
    return genderBanners
  }

  const getFinalBanner = () => {
    const finalBanner = banners.find((b) => b.position === "final" && b.is_active)
    console.log("[v0] Banner final encontrado:", finalBanner ? "Sí" : "No", finalBanner)
    return finalBanner
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      <Header />

      <main>
        <section className="w-full" ref={(el) => (sectionsRef.current[0] = el)}>
          <div className="w-full">
            <div className="relative overflow-hidden">
              {getSlides().length > 0 ? (
                <div className="flex transition-transform duration-500 ease-in-out">
                  {getSlides().map((slide, index) => (
                    <div key={slide.id} className="w-full flex-shrink-0">
                      <Link href={slide.link_url} className="block">
                        <div
                          className="h-64 md:h-96 bg-cover bg-center relative w-full"
                          style={{ backgroundImage: `url(${slide.image_url})` }}
                        >
                          <div className="absolute inset-0 bg-black/30 flex items-center md:hidden">
                            <div className="container mx-auto px-8">
                              <div className="max-w-md text-white">
                                <h1 className="text-3xl font-bold mb-2">{slide.title}</h1>
                                <p className="text-lg mb-4">{slide.subtitle}</p>
                                <Button className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-3">
                                  COMPRAR AHORA
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <HeroBanner />
              )}
            </div>
          </div>
        </section>

        <section className="w-full py-8 bg-white" ref={(el) => (sectionsRef.current[1] = el)}>
          <div className="container mx-auto px-4">
            <div className="relative">
              <ProductGrid featured={true} limit={5} showCarousel={true} />
            </div>
          </div>
        </section>

        <section className="w-full py-4" ref={(el) => (sectionsRef.current[2] = el)}>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {getCategoryBanners().map((banner) => (
                <Link
                  key={banner.id}
                  href={banner.link_url}
                  className="group relative overflow-hidden aspect-square bg-cover bg-center rounded-lg"
                  style={{ backgroundImage: `url(${banner.image_url})` }}
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <h3 className="text-xl font-bold">{banner.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-8 bg-white" ref={(el) => (sectionsRef.current[3] = el)}>
          <div className="container mx-auto px-4">
            <div className="relative">
              <ProductGrid limit={5} showCarousel={true} />
            </div>
          </div>
        </section>

        <section className="w-full py-4" ref={(el) => (sectionsRef.current[4] = el)}>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getGenderBanners().map((banner) => (
                <Link
                  key={banner.id}
                  href={banner.link_url}
                  className="group relative overflow-hidden aspect-[4/3] bg-cover bg-center rounded-lg"
                  style={{ backgroundImage: `url(${banner.image_url})` }}
                >
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <h3 className="text-5xl font-bold mb-2">{banner.title}</h3>
                    <p className="text-lg font-medium">VER MÁS</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {getFinalBanner() && (
          <section className="w-full py-4" ref={(el) => (sectionsRef.current[5] = el)}>
            <div className="container mx-auto px-4">
              <Link href={getFinalBanner()!.link_url}>
                <div className="w-full">
                  <img
                    src={getFinalBanner()!.image_url || "/placeholder.svg"}
                    alt={getFinalBanner()!.title}
                    className="w-full h-auto object-cover rounded-lg"
                  />
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Newsletter Section */}
        <section className="bg-muted/50 py-12 relative" ref={(el) => (sectionsRef.current[6] = el)}>
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

      {showPopup && popup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <div className="text-center">
              {popup.image_url && (
                <img
                  src={popup.image_url || "/placeholder.svg"}
                  alt={popup.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-xl font-bold mb-2">{popup.title}</h3>
              <p className="text-gray-600 mb-4">{popup.content}</p>
              <Button asChild className="w-full">
                <Link href={popup.link_url} onClick={() => setShowPopup(false)}>
                  Ver más
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
