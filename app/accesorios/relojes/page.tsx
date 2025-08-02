"use client"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const relojes = [
  {
    id: 1,
    name: "Reloj Deportivo Digital",
    price: 120,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Reloj+Deportivo",
    handle: "reloj-deportivo-digital",
    isNew: true,
  },
  {
    id: 2,
    name: "Reloj Clásico Analógico",
    price: 85,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Reloj+Clásico",
    handle: "reloj-clasico-analogico",
    isNew: false,
  },
  {
    id: 3,
    name: "Smartwatch Moderno",
    price: 180,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Smartwatch",
    handle: "smartwatch-moderno",
    isNew: true,
  },
  {
    id: 4,
    name: "Reloj Vintage",
    price: 95,
    imageUrl: "/placeholder.svg?width=400&height=400&text=Reloj+Vintage",
    handle: "reloj-vintage",
    isNew: false,
  },
]

export default function RelojesPage() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-950">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <Link href="/accesorios" className="hover:text-blue-950">
            Accesorios
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Relojes</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Relojes</h1>
          <p className="text-gray-600">Relojes de calidad para cada estilo de vida</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {relojes.map((product) => (
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
