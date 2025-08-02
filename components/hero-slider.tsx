"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const slides = [
  {
    id: 1,
    image: "/placeholder.svg?height=600&width=1200&text=Nueva+Colección+Verano",
    title: "Nueva Colección Verano",
    subtitle: "Descubre los últimos estilos",
    link: "/verano",
    cta: "Ver Colección",
  },
  {
    id: 2,
    image: "/placeholder.svg?height=600&width=1200&text=Ofertas+Especiales",
    title: "Ofertas Especiales",
    subtitle: "Hasta 50% de descuento",
    link: "/ofertas",
    cta: "Comprar Ahora",
  },
  {
    id: 3,
    image: "/placeholder.svg?height=600&width=1200&text=Accesorios+Únicos",
    title: "Accesorios Únicos",
    subtitle: "Completa tu look",
    link: "/accesorios",
    cta: "Explorar",
  },
]

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="relative h-[400px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide ? "translate-x-0" : index < currentSlide ? "-translate-x-full" : "translate-x-full"
          }`}
        >
          <Image
            src={slide.image || "/placeholder.svg"}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white max-w-2xl px-4">
              <h2 className="text-5xl font-bold mb-4">{slide.title}</h2>
              <p className="text-xl mb-8">{slide.subtitle}</p>
              <Link href={slide.link}>
                <Button size="lg" className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3">
                  {slide.cta}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation buttons */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-white" : "bg-white bg-opacity-50"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}
