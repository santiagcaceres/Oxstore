"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Menu, X, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"

// Obras destacadas para el slider
const featuredArtworks = [
  {
    id: 7,
    title: "Encuentro Dramático",
    category: "acrilicos",
    subcategory: "espatula", // ← AÑADIR SUBCATEGORÍA
    price: 25000,
    image: "/images/obra-dramatica.jpeg",
    description: "Acrílico sobre lienzo, 50x70cm",
    status: "Vendida",
  },
  {
    id: 1,
    title: "Paisaje Urbano",
    category: "acrilicos",
    subcategory: "espatula", // ← AÑADIR SUBCATEGORÍA
    price: 18000,
    image: "/placeholder.svg?height=400&width=600&text=Paisaje+Urbano&bg=ffd6cc&color=8b4513",
    description: "Acrílico sobre lienzo, 40x60cm",
  },
  {
    id: 3,
    title: "Naturaleza Muerta",
    category: "acrilicos",
    price: 12800,
    image: "/placeholder.svg?height=400&width=600&text=Naturaleza+Muerta&bg=d4f4dd&color=2d5016",
    description: "Acrílico sobre lienzo, 35x45cm",
  },
  {
    id: 5,
    title: "Escultura Abstracta",
    category: "otros",
    price: 32000,
    image: "/placeholder.svg?height=400&width=600&text=Escultura&bg=ffe4b5&color=cd853f",
    description: "Bronce patinado, 25x15x30cm",
  },
  {
    id: 2,
    title: "Retrato en Carboncillo",
    category: "dibujos",
    price: 7200,
    image: "/placeholder.svg?height=400&width=600&text=Retrato&bg=e6e6fa&color=4b0082",
    description: "Carboncillo sobre papel, 30x40cm",
  },
]

// Generar categorías dinámicamente basándose en las obras destacadas disponibles
const getAvailableCategories = () => {
  const availableCategories = new Set(featuredArtworks.map((artwork) => artwork.category))
  const categories = [{ id: "todos", name: "Todas" }]

  if (availableCategories.has("acrilicos")) categories.push({ id: "acrilicos", name: "Acrílicos" })
  if (availableCategories.has("oleos")) categories.push({ id: "oleos", name: "Óleos" })
  if (availableCategories.has("acuarelas")) categories.push({ id: "acuarelas", name: "Acuarelas" })
  if (availableCategories.has("dibujos")) categories.push({ id: "dibujos", name: "Dibujos" })
  if (availableCategories.has("otros")) categories.push({ id: "otros", name: "Otros" })

  return categories
}

// Reemplazar la definición estática de categories con:
const categories = getAvailableCategories()

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [filteredArtworks, setFilteredArtworks] = useState(featuredArtworks)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Filter artworks by category
  useEffect(() => {
    if (selectedCategory === "todos") {
      setFilteredArtworks(featuredArtworks)
    } else {
      setFilteredArtworks(featuredArtworks.filter((artwork) => artwork.category === selectedCategory))
    }
    setCurrentSlide(0) // Reset slide when category changes
  }, [selectedCategory])

  // Auto-slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % filteredArtworks.length)
    }, 6000) // Cambiado de 4000 a 6000
    return () => clearInterval(interval)
  }, [filteredArtworks.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % filteredArtworks.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + filteredArtworks.length) % filteredArtworks.length)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className={`shadow-sm sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-black text-white py-2 md:py-3" : "bg-white text-gray-900 py-4 md:py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <div className={`${isScrolled ? "flex-1 flex justify-center" : ""}`}>
              {isScrolled ? (
                // Logo blanco centrado cuando está scrolled
                <Image
                  src="/images/blanco-lucho.png"
                  alt="Lucho Logo"
                  width={120}
                  height={60}
                  className="h-8 md:h-10 w-auto"
                />
              ) : (
                // Logo negro cuando está arriba
                <Image
                  src="/images/negro-lucho.png"
                  alt="Fulco Logo"
                  width={150}
                  height={75}
                  className="h-10 md:h-12 w-auto"
                />
              )}
            </div>

            {/* Desktop Navigation - Solo visible cuando NO está scrolled */}
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

            {/* Mobile menu button - Solo visible cuando NO está scrolled */}
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

          {/* Mobile Navigation - Solo visible cuando NO está scrolled */}
          {!isScrolled && mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
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

      {/* Hero Section - Ahora es el slider principal */}
      <section className="relative bg-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <Image
            src="/images/hero-artwork.jpeg"
            alt="Obra de arte de fondo"
            fill
            className="object-cover"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-black mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">PINTURA SIMBÓLICA</h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
              Cada obra es una exploración del inconsciente hecha materia. Utilizo el arte como herramienta para tocar
              lo que no se dice, lo que se reprime, lo que se desplaza.
            </p>
          </div>

          {/* Category Filters - DISEÑO SIMÉTRICO 2x2 */}
          {/* Category Filters - HORIZONTAL EN DESKTOP, GRID EN MÓVIL */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              {/* Móvil: Grid adaptativo, Desktop: Una sola línea */}
              <div
                className={`grid gap-4 md:flex md:flex-wrap md:justify-center md:gap-4 ${
                  categories.length <= 4 ? "grid-cols-2" : "grid-cols-3"
                }`}
              >
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap min-w-[90px] ${
                      category.id === selectedCategory
                        ? "bg-black text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Artworks Slider */}
          <div className="relative">
            {/* Slider Container */}
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
                          src={artwork.image || "/placeholder.svg"}
                          alt={artwork.title}
                          width={600}
                          height={400}
                          className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <Badge className="capitalize">{artwork.category}</Badge>
                          {/* NUEVA ETIQUETA DE SUBCATEGORÍA */}
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
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{artwork.title}</h3>
                          <p className="text-lg text-gray-600 mb-4">{artwork.description}</p>
                          <p className="text-2xl md:text-3xl font-bold text-gray-900">$U {artwork.price}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Link href={`/obra/${artwork.id}`}>
                            <Button size="lg" className="w-full sm:w-auto">
                              Ver Detalles
                            </Button>
                          </Link>
                          <div className="flex gap-2">
                            <Button variant="outline" size="lg" className="flex-1 sm:flex-none bg-transparent">
                              <Mail className="w-4 h-4 mr-2" />
                              Email
                            </Button>
                            <Button variant="outline" size="lg" className="flex-1 sm:flex-none bg-transparent">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              WhatsApp
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>

            {/* Dots Indicator */}
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

          {/* Call to Action - Botón mejorado */}
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

      {/* About Section */}
      <section id="sobre-mi" className="bg-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12 items-center">
            {/* Texto - Ocupa 3 columnas en desktop */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Sobre Mí</h2>
              <div className="space-y-3 md:space-y-4 text-sm md:text-base text-gray-600">
                <p>
                  Soy Luciano Fulco, artista visual uruguayo. Mi obra nace del cruce entre la materia pictórica y el
                  pensamiento. Me inspiran el psicoanálisis, la filosofía y el lenguaje como lugar de fractura y verdad.
                  Pinto desde una identidad simbólica, explorando el inconsciente a través del color, la forma y el
                  empaste.
                </p>
                <p>
                  Nacido y criado en Uruguay, actualmente vivo y trabajo en Santa Lucía, donde encuentro inspiración en
                  libros, paisajes y la tensión de lo cotidiano.
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

            {/* Foto - Ocupa 1 columna en desktop */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <Image
                src="/images/luciano-fulco.jpeg"
                alt="Luciano Fulco en su estudio"
                width={350}
                height={450}
                className="rounded-lg shadow-lg w-full max-w-sm mx-auto lg:mx-0"
              />
              <p className="text-xs md:text-sm text-gray-500 mt-2 text-center">Luciano en su estudio de Santa Lucía</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-12 md:py-16 bg-white text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900">¿Interesado en alguna obra?</h2>
          <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto">
            Ponte en contacto conmigo para consultas sobre precios, disponibilidad o para solicitar una obra
            personalizada. Respondo todos los mensajes en menos de 24 horas.
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
                className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white text-sm md:text-base bg-transparent"
              >
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8">
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
              <p className="text-sm text-gray-300">&copy; 2024 LaunchByte. Todos los derechos reservados.</p>
              <p className="text-xs text-gray-400 mt-1">Desarrollo web profesional para artistas</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
