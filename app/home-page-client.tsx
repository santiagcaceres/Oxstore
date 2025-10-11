"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Menu, X, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"

interface HomePageClientProps {
  featuredArtworks: any[]
}

export default function HomePageClient({ featuredArtworks }: HomePageClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [showWelcome, setShowWelcome] = useState(true)
  const [isWelcomeFading, setIsWelcomeFading] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  const categories = useMemo(() => {
    const availableCategories = new Set(featuredArtworks.map((artwork) => artwork.category))
    const cats = [{ id: "todos", name: "Todas" }]
    if (availableCategories.has("oleos")) cats.push({ id: "oleos", name: "Óleos" })
    if (availableCategories.has("oleo-pastel")) cats.push({ id: "oleo-pastel", name: "Óleo Pastel" })
    if (availableCategories.has("acrilicos")) cats.push({ id: "acrilicos", name: "Acrílicos" })
    if (availableCategories.has("tecnica-mixta")) cats.push({ id: "tecnica-mixta", name: "Técnica Mixta" }) // 🆕 NUEVA CATEGORÍA EN 4TO LUGAR
    if (availableCategories.has("acuarelas")) cats.push({ id: "acuarelas", name: "Acuarelas" })
    if (availableCategories.has("dibujos")) cats.push({ id: "dibujos", name: "Dibujos" })
    if (availableCategories.has("otros")) cats.push({ id: "otros", name: "Otros" })
    return cats
  }, [featuredArtworks])

  const filteredArtworks = useMemo(() => {
    if (selectedCategory === "todos") {
      return featuredArtworks
    }
    return featuredArtworks.filter((artwork) => artwork.category === selectedCategory)
  }, [selectedCategory, featuredArtworks])

  useEffect(() => {
    setCurrentSlide(0)
  }, [selectedCategory])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (filteredArtworks.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % filteredArtworks.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [filteredArtworks.length])

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsWelcomeFading(true), 2500)
    const hideTimer = setTimeout(() => setShowWelcome(false), 3500)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % filteredArtworks.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + filteredArtworks.length) % filteredArtworks.length)

  return (
    <div className="min-h-screen relative">
      {/* Fondo artístico global */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-200/30 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-24 h-24 bg-blue-200/40 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-yellow-200/25 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-purple-200/35 rounded-full blur-lg animate-pulse delay-500"></div>
        <div className="absolute top-1/3 left-1/2 w-36 h-36 bg-green-200/20 rounded-full blur-2xl animate-pulse delay-1500"></div>
        <div className="absolute top-80 left-20 w-20 h-20 bg-orange-200/40 rounded-full blur-xl animate-pulse delay-3000"></div>
        <div className="absolute bottom-60 right-10 w-44 h-44 bg-pink-200/25 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {showWelcome && (
        <div
          className={`fixed inset-0 bg-black flex flex-col items-center justify-center transition-opacity duration-1000 z-[9999] ${
            isWelcomeFading ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex-1 flex items-center justify-center">
            <Image
              src="/images/blanco-lucho.png"
              alt="Fulco Logo"
              width={180}
              height={90}
              className="animate-pulse"
              priority
            />
          </div>
          <div className="pb-8 flex items-center gap-2">
            <span className="text-white text-xs opacity-60">Powered by</span>
            <Image
              src="/images/launchbyte-logo.png"
              alt="LaunchByte Logo"
              width={20}
              height={20}
              className="brightness-0 invert"
            />
            <span className="text-white text-xs opacity-60 font-medium">LaunchByte</span>
          </div>
        </div>
      )}

      <header
        className={`shadow-sm sticky top-0 z-50 transition-all duration-300 backdrop-blur-sm ${
          isScrolled ? "bg-black/90 text-white py-2 md:py-3" : "bg-white/80 text-gray-900 py-4 md:py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className={`${isScrolled ? "flex-1 flex justify-center" : ""}`}>
              {isScrolled ? (
                <Image
                  src="/images/blanco-lucho.png"
                  alt="Lucho Logo"
                  width={120}
                  height={60}
                  className="h-8 md:h-10 w-auto"
                />
              ) : (
                <Image
                  src="/images/negro-lucho.png"
                  alt="Fulco Logo"
                  width={150}
                  height={75}
                  className="h-10 md:h-12 w-auto"
                />
              )}
            </Link>
            {!isScrolled && (
              <nav className="hidden md:flex space-x-8">
                <Link href="/obras" className="text-gray-700 hover:text-gray-900 transition-colors">
                  Obras
                </Link>
                <a
                  href="#sobre-mi"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById("sobre-mi")?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  Sobre Mí
                </a>
                <a
                  href="#contacto"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  Contacto
                </a>
              </nav>
            )}
            {!isScrolled && (
              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-gray-900" /> : <Menu className="w-6 h-6 text-gray-900" />}
              </button>
            )}
          </div>
          {!isScrolled && mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4 bg-white/90 backdrop-blur-sm rounded-b-lg">
              <nav className="flex flex-col space-y-4">
                <Link
                  href="/obras"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Obras
                </Link>
                <a
                  href="#sobre-mi"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    setMobileMenuOpen(false)
                    document.getElementById("sobre-mi")?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  Sobre Mí
                </a>
                <a
                  href="#contacto"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    setMobileMenuOpen(false)
                    document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  Contacto
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main>
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/images/hero-artwork.jpeg"
              alt="Obra de arte de fondo"
              fill
              className="object-cover"
              style={{ objectFit: "cover" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-transparent to-white/40"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-black mb-12">
              <h2 className="text-4xl md:text-5xl font-serif-display font-bold mb-4">PINTURA SIMBÓLICA</h2>
            </div>

            <div className="flex justify-center mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                <div
                  className={`grid gap-3 md:flex md:flex-wrap md:justify-center md:gap-4 ${
                    categories.length <= 4 ? "grid-cols-2" : "grid-cols-3"
                  }`}
                >
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap min-w-[80px] ${
                        category.id === selectedCategory
                          ? "bg-black text-white shadow-lg"
                          : "bg-white/80 text-gray-700 hover:bg-white border border-gray-200"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredArtworks.length > 0 ? (
              <div className="relative">
                <div className="overflow-hidden rounded-lg">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {filteredArtworks.map((artwork) => (
                      <div key={artwork.id} className="w-full flex-shrink-0">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                          <div className="relative">
                            <Image
                              src={
                                artwork.main_image_url ||
                                `https://placehold.co/600x400/E5E7EB/374151/jpeg?text=${encodeURIComponent(artwork.title) || "/placeholder.svg"}`
                              }
                              alt={artwork.title}
                              width={600}
                              height={400}
                              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                            />
                            <div className="absolute top-4 left-4 flex gap-2">
                              <Badge className="capitalize">{artwork.category}</Badge>
                              {artwork.subcategory && (
                                <Badge variant="outline" className="capitalize bg-white/90">
                                  {artwork.subcategory}
                                </Badge>
                              )}
                              {artwork.status === "Vendida" && (
                                <div className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                  Vendida
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-6 bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                            <div>
                              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{artwork.title}</h3>
                              <p className="text-lg text-gray-600 mb-4">{artwork.description}</p>
                              <p className="text-2xl md:text-3xl font-bold text-gray-900">USD {artwork.price}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                              <Link href={`/obra/${artwork.id}`} className="w-full sm:w-auto">
                                <Button size="lg" className="w-full bg-black hover:bg-gray-800 text-white">
                                  Ver Detalles
                                </Button>
                              </Link>
                              <a
                                href={`mailto:luciano.fulco51@hotmail.com?subject=Consulta%20por%20la%20obra%20'${encodeURIComponent(
                                  artwork.title,
                                )}'&body=Hola,%20estoy%20interesado/a%20en%20la%20obra%20'${encodeURIComponent(
                                  artwork.title,
                                )}'.%20Quisiera%20recibir%20más%20información.`}
                                className="flex-1 sm:flex-none"
                              >
                                <Button
                                  variant="outline"
                                  size="lg"
                                  className="w-full bg-white/80 backdrop-blur-sm border-black text-black hover:bg-black hover:text-white"
                                >
                                  <Mail className="w-4 h-4 mr-2" />
                                  Email
                                </Button>
                              </a>
                              <a
                                href={`https://wa.me/59898059079?text=${encodeURIComponent(
                                  `Hola, estoy interesado/a en la obra '${artwork.title}'.`,
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 sm:flex-none"
                              >
                                <Button
                                  variant="outline"
                                  size="lg"
                                  className="w-full bg-white/80 backdrop-blur-sm border-black text-black hover:bg-black hover:text-white"
                                >
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  WhatsApp
                                </Button>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={prevSlide}
                  className="hidden md:block absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all backdrop-blur-sm"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>
                <button
                  onClick={nextSlide}
                  className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all backdrop-blur-sm"
                >
                  <ChevronRight className="w-6 h-6 text-gray-800" />
                </button>
                <div className="flex justify-center mt-8 space-x-2">
                  {filteredArtworks.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentSlide ? "bg-gray-800" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600 bg-white/80 backdrop-blur-sm rounded-lg">
                No hay obras destacadas en esta categoría.
              </div>
            )}
            <div className="text-center mt-12">
              <Link href="/obras">
                <Button
                  size="lg"
                  className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:ring-4 hover:ring-gray-300"
                >
                  Ver Todas las Obras
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* SECCIÓN PINTURA SIMBÓLICA - SIN INTERACTIVIDAD, CON PARALLAX ORIGINAL */}
        <section id="pintura-simbolica" className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/60 to-white/80 backdrop-blur-sm"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
              {/* Texto - ACTUALIZADO */}
              <div className="order-1 lg:order-1 space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Pintura Simbólica</h2>
                <div className="space-y-4 text-sm md:text-base text-gray-600">
                  <p>
                    Cada obra es una exploración del inconsciente hecha materia. Trabajo desde un lenguaje pictórico
                    propio, cargado de empastes, símbolos y tensión. Utilizo el arte como herramienta para tocar lo que
                    no se dice, lo que se reprime, lo que se desplaza.
                  </p>
                  <p>
                    A través de una estética densa y conceptual, mis pinturas abren un espacio para la incomodidad
                    productiva, esa que no deja igual al que mira.
                  </p>
                </div>
              </div>

              {/* Galería de Imágenes - VUELTO AL ORIGINAL SIN CLICK */}
              <div className="order-2 lg:order-2 relative">
                {/* MOBILE: Layout simple */}
                <div className="block lg:hidden space-y-6">
                  <div className="bg-white p-3 rounded-lg shadow-lg">
                    <Image
                      src="/images/pintura-simbolica-1.jpeg"
                      alt="Obra simbólica - Figuras en paisaje tormentoso"
                      width={400}
                      height={500}
                      className="rounded-md w-full h-auto"
                    />
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-lg">
                    <Image
                      src="/images/pintura-simbolica-2.png"
                      alt="Obra simbólica - Conexiones rojas"
                      width={350}
                      height={450}
                      className="rounded-md w-full h-auto"
                    />
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-lg">
                    <Image
                      src="/images/pintura-simbolica.jpeg"
                      alt="Pintura simbólica de Luciano Fulco"
                      width={300}
                      height={400}
                      className="rounded-md w-full h-auto"
                    />
                  </div>
                </div>

                {/* DESKTOP: Layout con parallax - IMAGEN 2 MÁS PROMINENTE */}
                <div className="hidden lg:block relative h-[600px] md:h-[700px]">
                  {/* Imagen 1 - Más pequeña y hacia atrás */}
                  <div
                    className="absolute top-16 left-0 w-2/3 z-10 transform transition-transform duration-1000 ease-out"
                    style={{
                      transform: `translateY(${scrollY * 0.1}px) rotate(-2deg)`,
                    }}
                  >
                    <div className="bg-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-500">
                      <Image
                        src="/images/pintura-simbolica-1.jpeg"
                        alt="Obra simbólica - Figuras en paisaje tormentoso"
                        width={350}
                        height={450}
                        className="rounded-md w-full h-auto"
                      />
                    </div>
                  </div>

                  {/* Imagen 2 - MÁS PROMINENTE Y AL FRENTE */}
                  <div
                    className="absolute top-0 right-0 w-4/5 z-30 transform transition-transform duration-1000 ease-out"
                    style={{
                      transform: `translateY(${scrollY * -0.12}px) rotate(2deg)`,
                    }}
                  >
                    <div className="bg-white p-4 rounded-lg shadow-2xl hover:shadow-3xl transition-shadow duration-500 ring-2 ring-blue-100">
                      <Image
                        src="/images/pintura-simbolica-2.png"
                        alt="Obra simbólica - Conexiones rojas"
                        width={400}
                        height={500}
                        className="rounded-md w-full h-auto"
                      />
                    </div>
                  </div>

                  {/* Imagen 3 - Más pequeña y hacia atrás */}
                  <div
                    className="absolute bottom-8 left-1/4 w-3/5 z-20 transform transition-transform duration-1000 ease-out"
                    style={{
                      transform: `translateY(${scrollY * 0.08}px) rotate(-1deg)`,
                    }}
                  >
                    <div className="bg-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-500">
                      <Image
                        src="/images/pintura-simbolica.jpeg"
                        alt="Pintura simbólica de Luciano Fulco"
                        width={280}
                        height={360}
                        className="rounded-md w-full h-auto"
                      />
                    </div>
                  </div>

                  {/* Elementos decorativos flotantes */}
                  <div
                    className="absolute top-10 right-10 w-4 h-4 bg-red-400/30 rounded-full blur-sm animate-pulse"
                    style={{
                      transform: `translateY(${scrollY * 0.2}px)`,
                    }}
                  ></div>
                  <div
                    className="absolute bottom-20 left-10 w-6 h-6 bg-blue-400/20 rounded-full blur-md animate-pulse delay-1000"
                    style={{
                      transform: `translateY(${scrollY * -0.1}px)`,
                    }}
                  ></div>
                  <div
                    className="absolute top-1/2 right-5 w-3 h-3 bg-yellow-400/40 rounded-full blur-sm animate-pulse delay-2000"
                    style={{
                      transform: `translateY(${scrollY * 0.15}px)`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN SOBRE MÍ */}
        <section id="sobre-mi" className="py-12 md:py-16 relative">
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12 items-center">
              {/* Texto */}
              <div className="lg:col-span-3 order-1 lg:order-1">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Sobre Mí</h2>
                <div className="space-y-3 md:space-y-4 text-sm md:text-base text-gray-600">
                  <p>
                    Soy Luciano Fulco, artista visual uruguayo. Mi obra nace del cruce entre la materia pictórica y el
                    pensamiento. Me inspiran el psicoanálisis, la filosofía y el lenguaje como lugar de fractura y
                    verdad. Pinto desde una identidad simbólica, explorando el inconsciente a través del color, la forma
                    y el empaste.
                  </p>
                  <p>
                    Nacido y criado en Uruguay, actualmente vivo y trabajo en Santa Lucía, donde encuentro inspiración
                    en libros, paisajes y la tensión de lo cotidiano.
                  </p>
                  <p>
                    Con más de 10 años de experiencia, he participado en exposiciones en Nueva York, Berlín y distintas
                    ciudades de Uruguay, trabajando junto a Galerías internacionales y formando parte de colecciones
                    privadas.
                  </p>
                </div>
                <div className="mt-6 md:mt-8">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Formación</h3>
                  <ul className="space-y-1 md:space-y-2 text-sm md:text-base text-gray-600">
                    <li>• Tutoría intensiva en Pintura Clásica con Sebastián Salvo (1 año)</li>
                    <li>• Cursos de óleo, acrílico y técnicas mixtas con Antonio García Villarán</li>
                    <li>• Curso de soltura y espátula con Antonio García Villarán</li>
                  </ul>
                </div>
              </div>
              {/* Foto */}
              <div className="lg:col-span-1 order-2 lg:order-2">
                <Image
                  src="/images/luciano-fulco.jpeg"
                  alt="Luciano Fulco en su estudio"
                  width={350}
                  height={450}
                  className="rounded-lg shadow-lg w-full max-w-sm mx-auto lg:mx-0"
                />
                <p className="text-xs md:text-sm text-gray-500 mt-2 text-center">
                  Luciano en su estudio de Santa Lucía
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contacto" className="py-12 md:py-16 relative">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900">¿Interesado en alguna obra?</h2>
            <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto">
              Ponte en contacto conmigo para consultas sobre precios, disponibilidad. Respondo todos los mensajes en
              menos de 24 horas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="mailto:luciano.fulco51@hotmail.com">
                <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800 text-sm md:text-base">
                  <Mail className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  luciano.fulco51@hotmail.com
                </Button>
              </a>
              <a href="https://wa.me/59898059079" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white text-sm md:text-base bg-white/80 backdrop-blur-sm"
                >
                  <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black/90 backdrop-blur-sm text-white py-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/launchbyte-logo.png"
                alt="LaunchByte Logo"
                width={32}
                height={32}
                className="brightness-0 invert"
              />
              <span className="text-lg font-semibold">LaunchByte</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-300">&copy; 2025 LaunchByte. Todos los derechos reservados.</p>
              <p className="text-xs text-gray-400 mt-1">Desarrollo web profesional</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
