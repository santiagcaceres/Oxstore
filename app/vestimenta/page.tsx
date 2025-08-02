"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const vestimentaCategories = [
  {
    name: "Remeras",
    description: "Básicas, oversize, estampadas y más",
    image: "/placeholder.svg?width=400&height=300&text=Remeras",
    href: "/vestimenta/remeras",
    count: "45+ productos",
  },
  {
    name: "Buzos",
    description: "Con capucha, canguro, deportivos",
    image: "/placeholder.svg?width=400&height=300&text=Buzos",
    href: "/vestimenta/buzos",
    count: "32+ productos",
  },
  {
    name: "Pantalones",
    description: "Jeans, cargo, vestir, joggers",
    image: "/placeholder.svg?width=400&height=300&text=Pantalones",
    href: "/vestimenta/pantalones",
    count: "58+ productos",
  },
  {
    name: "Camperas",
    description: "Bomber, denim, parka, blazer",
    image: "/placeholder.svg?width=400&height=300&text=Camperas",
    href: "/vestimenta/camperas",
    count: "28+ productos",
  },
  {
    name: "Vestidos",
    description: "Casuales, elegantes, de fiesta",
    image: "/placeholder.svg?width=400&height=300&text=Vestidos",
    href: "/vestimenta/vestidos",
    count: "35+ productos",
  },
  {
    name: "Faldas",
    description: "Mini, midi, maxi, plisadas",
    image: "/placeholder.svg?width=400&height=300&text=Faldas",
    href: "/vestimenta/faldas",
    count: "22+ productos",
  },
]

export default function VestimentaPage() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-950">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Vestimenta</span>
        </nav>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Vestimenta</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre nuestra amplia colección de ropa para hombre y mujer. Desde básicos hasta piezas statement,
            encuentra todo lo que necesitas para expresar tu estilo.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vestimentaCategories.map((category) => (
            <Link key={category.name} href={category.href} className="group">
              <div className="bg-gray-50 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold mb-1">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.count}</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <Button className="w-full bg-blue-950 hover:bg-blue-900 group-hover:bg-blue-800 transition-colors">
                    Ver {category.name}
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-950 to-blue-800 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">¿No encuentras lo que buscas?</h2>
          <p className="text-xl mb-6 opacity-90">
            Explora todas nuestras categorías o contacta con nuestro equipo para ayudarte a encontrar la prenda
            perfecta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/hombre">
              <Button
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-blue-950"
              >
                Ver Colección Hombre
              </Button>
            </Link>
            <Link href="/mujer">
              <Button
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-blue-950"
              >
                Ver Colección Mujer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
