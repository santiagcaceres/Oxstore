"use client"

import { useState, useEffect, useMemo } from "react"
import { getAllZureoProducts } from "@/lib/zureo-api"
import { transformZureoProduct } from "@/lib/data-transformer"
import type { Product } from "@/types/product"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Package } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function loadProducts() {
      try {
        const zureoData = await getAllZureoProducts()
        // Aquí asumimos que `transformZureoProduct` ya está obteniendo las imágenes de Vercel Blob
        // y las añade al objeto `product`.
        const transformedProducts = zureoData.map(transformZureoProduct)
        setProducts(transformedProducts)
      } catch (error) {
        console.error("Error loading products:", error)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  const completeProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.images &&
        p.images.length > 0 && // Tiene imagen
        p.variants[0]?.price > 0 && // Tiene precio
        p.vendor &&
        p.vendor.trim() !== "", // Tiene marca
    )
  }, [products])

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return completeProducts
    return completeProducts.filter(
      (product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.vendor && product.vendor.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [searchTerm, completeProducts])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos completos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Productos Completos</h1>
          <p className="text-gray-600 mt-1">Mostrando productos con imagen, precio y marca.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, código o marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative bg-gray-100">
                <Image
                  src={product.images[0]?.src || "/placeholder.svg"}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold text-sm line-clamp-2 h-10">{product.title}</h3>
                <Badge variant="outline">{product.vendor}</Badge>
                <p className="text-xs text-gray-500">Código: {product.handle}</p>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-lg">{formatPrice(product.variants[0].price)}</span>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/producto/${product.handle}`} target="_blank">
                      Ver
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron productos completos</h3>
          <p className="text-gray-600">Asegúrate de que los productos tengan imagen, precio y marca asignada.</p>
        </div>
      )}
    </div>
  )
}
