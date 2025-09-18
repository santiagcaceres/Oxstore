"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface SimilarProduct {
  id: number
  name: string
  price: number
  image_url: string
  slug: string
  brand: string
  category: string
  stock_quantity: number
}

interface SimilarProductsProps {
  productId: number
}

export default function SimilarProducts({ productId }: SimilarProductsProps) {
  const [products, setProducts] = useState<SimilarProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        const response = await fetch(`/api/products/similar/${productId}`)
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        }
      } catch (error) {
        console.error("[v0] Error fetching similar products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarProducts()
  }, [productId])

  if (loading) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Productos Similares</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">Productos Similares</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link key={product.id} href={`/producto/${product.slug}`}>
            <Card className="group hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="aspect-square relative mb-3 overflow-hidden rounded-lg">
                  <Image
                    src={product.image_url || "/placeholder.svg?height=200&width=200"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <h3 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-gray-900">${product.price.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
