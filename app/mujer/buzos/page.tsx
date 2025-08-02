"use client"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const buzosMujer = [
  {
    id: 1,
    name: "Buzo Oversize",
    price: 68,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Buzo+Oversize+Mujer",
    handle: "buzo-oversize-mujer",
    isNew: true,
  },
  {
    id: 2,
    name: "Buzo Crop",
    price: 65,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Buzo+Crop",
    handle: "buzo-crop-mujer",
    isNew: false,
  },
  {
    id: 3,
    name: "Buzo con Capucha",
    price: 72,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Buzo+Capucha+Mujer",
    handle: "buzo-capucha-mujer",
    isNew: true,
  },
]

export default function BuzosMujerPage() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-950">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <Link href="/mujer" className="hover:text-blue-950">
            Mujer
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Buzos</span>
        </nav>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Buzos para Mujer</h1>
          <p className="text-gray-600">Buzos femeninos cómodos y elegantes</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {buzosMujer.map((product) => (
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
