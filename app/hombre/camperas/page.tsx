"use client"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const camperasHombre = [
  {
    id: 1,
    name: "Campera Bomber Clásica",
    price: 125,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Bomber+Hombre",
    handle: "campera-bomber-clasica",
    isNew: true,
  },
  {
    id: 2,
    name: "Parka Impermeable",
    price: 155,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Parka+Hombre",
    handle: "parka-impermeable",
    isNew: false,
  },
  {
    id: 3,
    name: "Campera de Cuero",
    price: 185,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Cuero+Hombre",
    handle: "campera-cuero-hombre",
    isNew: true,
  },
  {
    id: 4,
    name: "Campera Deportiva",
    price: 88,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Deportiva+Hombre",
    handle: "campera-deportiva-hombre",
    isNew: false,
  },
]

export default function CamperasHombrePage() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-950">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <Link href="/hombre" className="hover:text-blue-950">
            Hombre
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Camperas</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Camperas para Hombre</h1>
          <p className="text-gray-600">Camperas masculinas para todas las estaciones</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {camperasHombre.map((product) => (
            <Link href={`/producto/${product.handle}`} key={product.id} className="group">
              <div className="bg-gray-50 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                <div className="relative aspect-square">
                  <Image
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.isNew && <Badge className="absolute top-3 right-3 bg-blue-950 text-white">Nuevo</Badge>}
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-lg text-gray-800 mb-1">{product.name}</h3>
                  <p className="text-blue-950 font-bold text-xl">${product.price}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
