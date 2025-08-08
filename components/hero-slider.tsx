"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"

const slides = [
  {
    id: 1,
    title: "Nueva Colección Verano",
    subtitle: "Descubre las últimas tendencias",
    description: "Ropa fresca y cómoda para la temporada",
    image: "/placeholder.svg?height=600&width=1200&text=Colección+Verano",
    cta: "Ver Colección",
    link: "/verano",
    bgColor: "bg-gradient-to-r from-black to-gray-800"
  },
  {
    id: 2,
    title: "Ofertas Especiales",
    subtitle: "Hasta 50% de descuento",
    description: "En productos seleccionados por tiempo limitado",
    image: "/placeholder.svg?height=600&width=1200&text=Ofertas+Especiales",
    cta: "Ver Ofertas",
    link: "/ofertas",
    bgColor: "bg-gradient-to-r from-gray-900 to-black"
  },
  {
    id: 3,
    title: "Accesorios Premium",
    subtitle: "Completa tu look",
    description: "La mejor selección de accesorios de marca",
    image: "/placeholder.svg?height=600&width=1200&text=Accesorios+Premium",
    cta: "Explorar",
    link: "/accesorios",
    bgColor: "bg-gradient-to-r from-black via-gray-800 to-black"
  }
]

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div 
      className="relative h-[70vh] md:h-[80vh] overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
            index === currentSlide ? "translate-x-0" : 
            index < currentSlide ? "-translate-x-full" : "translate-x-full"
          }`}
        >
          <div className={`relative h-full ${slide.bgColor}`}>
            <Image
              src={slide.image || "/placeholder.svg"}
              alt={slide.title}
              fill
              className="object-cover opacity-60"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30" />
            
            <div className="relative z-10 h-full flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl text-white">
                  <h2 className="text-sm md:text-base font-medium mb-2 tracking-wider uppercase">
                    {slide.subtitle}
                  </h2>
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl mb-8 text-gray-200">
                    {slide.description}
                  </p>
                  <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100">
                    <Link href={slide.link}>
                      {slide.cta}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white border-0"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white border-0"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? "bg-white scale-110" 
                : "bg-white/50 hover:bg-white/75"
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}
