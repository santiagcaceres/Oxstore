"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Palette, Eye, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

const heroImages = [
  "/placeholder.svg?height=600&width=800&text=Arte+Uruguayo&bg=ffd6cc&color=8b4513",
  "/placeholder.svg?height=600&width=800&text=Expresión+Artística&bg=e6e6fa&color=4b0082",
  "/placeholder.svg?height=600&width=800&text=Creatividad&bg=d4f4dd&color=2d5016",
]

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-30" : "opacity-0"
              }`}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`Arte ${index + 1}`}
                fill
                className="object-cover"
                style={{ objectFit: "cover" }}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <Palette className="w-16 h-16 md:w-20 md:h-20 text-gray-800 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4">Luciano Fulco</h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 mb-8">Artista Visual Uruguayo</p>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              Descubre un mundo de arte que captura la esencia de Uruguay a través del color, la forma y la expresión
              más pura del alma artística.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mb-12 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">15+</div>
              <div className="text-sm md:text-base text-gray-600">Años de Experiencia</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">50+</div>
              <div className="text-sm md:text-base text-gray-600">Obras Creadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">20+</div>
              <div className="text-sm md:text-base text-gray-600">Exposiciones</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/">
              <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg">
                <Eye className="w-5 h-5 mr-2" />
                Explorar Obras
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/#sobre-mi">
              <Button
                variant="outline"
                size="lg"
                className="border-black text-black hover:bg-black hover:text-white px-8 py-4 text-lg bg-transparent"
              >
                <Heart className="w-5 h-5 mr-2" />
                Conocer al Artista
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-800 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-800 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Quick Preview Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Arte que Trasciende Fronteras</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
            Desde Santa Lucía, Uruguay, cada obra nace de la pasión por capturar momentos únicos y transformarlos en
            expresiones artísticas que conectan con el alma del espectador.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Técnicas Diversas</h3>
              <p className="text-gray-600">Acrílicos, carboncillo, técnicas mixtas y más</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Visión Única</h3>
              <p className="text-gray-600">Perspectiva uruguaya con alcance universal</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pasión Auténtica</h3>
              <p className="text-gray-600">Cada obra refleja años de dedicación y amor al arte</p>
            </div>
          </div>

          <Link href="/">
            <Button size="lg" className="bg-black hover:bg-gray-800 text-white">
              Ingresar al Portafolio
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
