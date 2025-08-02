"use client"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const remerasMujer = [
  {
    id: 1,
    name: "Blusa Elegante",
    price: 42,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Blusa+Mujer",
    handle: "blusa-elegante",
    isNew: true,
  },
  {
    id: 2,
    name: "Top Deportivo",
    price: 35,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Top+Deportivo",
    handle: "top-deportivo",
    isNew: false,
  },
  {
    id: 3,
    name: "Remera Oversize",
    price: 38,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Remera+Oversize",
    handle: "remera-oversize-mujer",
    isNew: true,
  },
]

export default function RemerasMujerPage() {
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
          <span className="text-gray-900 font-medium">Remeras</span>
        </nav>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Remeras para Mujer</h1>
          <p className="text-gray-600">Remeras femeninas con estilo</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {remerasMujer.map((product) => (
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
