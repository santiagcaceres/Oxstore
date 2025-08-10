"use client"

import Image from "next/image"
import Link from "next/link"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"

type Brand = {
  id: number
  nombre: string
  imageUrl: string
}

export default function BrandCarousel({ brands }: { brands: Brand[] }) {
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: {
      perView: 2,
      spacing: 15,
    },
    breakpoints: {
      "(min-width: 768px)": {
        slides: { perView: 4, spacing: 20 },
      },
      "(min-width: 1024px)": {
        slides: { perView: 6, spacing: 25 },
      },
    },
  })

  if (!brands || brands.length === 0) {
    return null
  }

  return (
    <div ref={sliderRef} className="keen-slider">
      {brands.map((brand) => (
        <div key={brand.id} className="keen-slider__slide">
          <Link href={`/marcas/${encodeURIComponent(brand.nombre)}`} className="group block">
            <div className="aspect-video flex items-center justify-center bg-gray-100 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
              <div className="relative h-16 w-full">
                <Image
                  src={brand.imageUrl || "/placeholder.svg"}
                  alt={`Logo de ${brand.nombre}`}
                  fill
                  className="object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                />
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}
