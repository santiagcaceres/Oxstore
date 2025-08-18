"use client"

import { useState, useEffect } from "react"
import { getBrandsFromZureo } from "@/lib/zureo-api"

interface Brand {
  id: number
  nombre: string
  logo?: string
}

const ALLOWED_BRANDS = [
  "MISTRAL",
  "UNIFORM",
  "LEVIS",
  "KETZIA",
  "INDIAN",
  "KABOA",
  "EMPATHIA",
  "ROTUNDA",
  "LEMON",
  "GATTO PARDO",
  "MINOT",
  "MANDAL",
  "SYMPHORI",
  "NEUFO",
  "BROOKSFIELD",
  "PEGUIN",
]

export default function BrandsMarquee() {
  const [brands, setBrands] = useState<Brand[]>([])

  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    try {
      const allBrands = await getBrandsFromZureo()
      const filteredBrands = allBrands.filter((brand: Brand) => ALLOWED_BRANDS.includes(brand.nombre.toUpperCase()))
      setBrands(filteredBrands)
    } catch (error) {
      console.error("Error loading brands:", error)
    }
  }

  if (brands.length === 0) return null

  // Duplicar las marcas para efecto infinito
  const duplicatedBrands = [...brands, ...brands]

  return (
    <section className="py-8 bg-gray-50 overflow-hidden">
      <div className="relative">
        <div className="flex animate-marquee space-x-12">
          {duplicatedBrands.map((brand, index) => (
            <div key={`${brand.id}-${index}`} className="flex-shrink-0 h-16 w-32 flex items-center justify-center">
              {brand.logo ? (
                <img
                  src={brand.logo || "/placeholder.svg"}
                  alt={brand.nombre}
                  className="max-h-12 max-w-28 object-contain filter grayscale opacity-60 hover:opacity-80 transition-opacity"
                />
              ) : (
                <div className="text-gray-400 font-bold text-lg">{brand.nombre}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%) }
          100% { transform: translateX(-50%) }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  )
}
