"use client"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const remerasHombre = [
  {
    id: 1,
    name: "Remera Básica Algodón",
    price: 35,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Remera+Básica",
    handle: "remera-basica-algodon",
    isNew: true,
  },
  {
    id: 2,
    name: "Polo Clásico",
    price: 45,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Polo+Clásico",
    handle: "polo-clasico",
    isNew: false,
  },
  {
    id: 3,
    name: "Remera Estampada",
    price: 40,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Remera+Estampada",
    handle: "remera-estampada",
    isNew: true,
  },
]

export default function RemerasHombrePage() {
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
          <span className="text-gray-900 font-medium">Remeras</span>
        </nav>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Remeras para Hombre</h1>
          <p className="text-gray-600">Remeras cómodas y con estilo</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {remerasHombre.map((product) => (
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
