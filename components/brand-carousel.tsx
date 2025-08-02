"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

const brands = [
  { id: 1, name: "Nike", logo: "/placeholder.svg?height=60&width=120&text=Nike" },
  { id: 2, name: "Adidas", logo: "/placeholder.svg?height=60&width=120&text=Adidas" },
  { id: 3, name: "Puma", logo: "/placeholder.svg?height=60&width=120&text=Puma" },
  { id: 4, name: "Reebok", logo: "/placeholder.svg?height=60&width=120&text=Reebok" },
  { id: 5, name: "Converse", logo: "/placeholder.svg?height=60&width=120&text=Converse" },
  { id: 6, name: "Vans", logo: "/placeholder.svg?height=60&width=120&text=Vans" },
  { id: 7, name: "New Balance", logo: "/placeholder.svg?height=60&width=120&text=New+Balance" },
  { id: 8, name: "Under Armour", logo: "/placeholder.svg?height=60&width=120&text=Under+Armour" },
]

export default function BrandCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId: number
    let scrollPosition = 0

    const animate = () => {
      scrollPosition += 0.5

      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0
      }

      scrollContainer.scrollLeft = scrollPosition
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  return (
    <div className="overflow-hidden">
      <div ref={scrollRef} className="flex space-x-12 overflow-x-hidden" style={{ scrollBehavior: "auto" }}>
        {/* Duplicamos las marcas para el efecto infinito */}
        {[...brands, ...brands].map((brand, index) => (
          <div
            key={`${brand.id}-${index}`}
            className="flex-shrink-0 flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
          >
            <Image
              src={brand.logo || "/placeholder.svg"}
              alt={brand.name}
              width={120}
              height={60}
              className="object-contain opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
