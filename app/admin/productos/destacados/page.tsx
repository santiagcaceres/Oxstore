"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Star, Percent } from "lucide-react"

interface Product {
  id: number
  name: string
  custom_name?: string
  price: number
  sale_price?: number
  discount_percentage: number
  is_featured: boolean
  brand: string
  category: string
  stock: number
  images: string[]
  custom_images: string[]
}

export default function ProductosDestacados() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products/featured")
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateProduct = async (productId: number, updates: Partial<Product>) => {
    setSaving(productId)
    try {
      const response = await fetch(`/api/products/featured/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updates } : p)))
      }
    } catch (error) {
      console.error("Error updating product:", error)
    } finally {
      setSaving(null)
    }
  }

  const toggleFeatured = (productId: number, featured: boolean) => {
    updateProduct(productId, { is_featured: featured })
  }

  const updateDiscount = (productId: number, discount: number) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const salePrice = discount > 0 ? product.price * (1 - discount / 100) : null

    updateProduct(productId, {
      discount_percentage: discount,
      sale_price: salePrice,
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Productos Destacados</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const featuredProducts = products.filter((p) => p.is_featured)
  const regularProducts = products.filter((p) => !p.is_featured)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Productos Destacados</h1>
          <p className="text-muted-foreground">Gestiona productos destacados y aplica descuentos especiales</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {featuredProducts.length} destacados
        </Badge>
      </div>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Productos Destacados
          </h2>
          <div className="grid gap-4">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="border-yellow-200 bg-yellow-50/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{product.custom_name || product.name}</h3>
                        <Badge variant="secondary">{product.brand}</Badge>
                        <Badge variant="outline">{product.category}</Badge>
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Precio:</span>
                          <span className="font-medium">${product.price}</span>
                          {product.sale_price && (
                            <span className="text-green-600 font-medium">→ ${product.sale_price.toFixed(2)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Stock:</span>
                          <span className="font-medium">{product.stock}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={product.is_featured}
                            onCheckedChange={(checked) => toggleFeatured(product.id, checked)}
                            disabled={saving === product.id}
                          />
                          <Label className="text-sm">Destacado</Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm">Descuento:</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={product.discount_percentage}
                            onChange={(e) => updateDiscount(product.id, Number(e.target.value))}
                            className="w-20"
                            disabled={saving === product.id}
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Products */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Todos los Productos</h2>
        <div className="grid gap-4">
          {regularProducts.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{product.custom_name || product.name}</h3>
                      <Badge variant="secondary">{product.brand}</Badge>
                      <Badge variant="outline">{product.category}</Badge>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Precio:</span>
                        <span className="font-medium">${product.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Stock:</span>
                        <span className="font-medium">{product.stock}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.is_featured}
                          onCheckedChange={(checked) => toggleFeatured(product.id, checked)}
                          disabled={saving === product.id}
                        />
                        <Label className="text-sm">Destacar producto</Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm">Descuento:</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={product.discount_percentage}
                          onChange={(e) => updateDiscount(product.id, Number(e.target.value))}
                          className="w-20"
                          disabled={saving === product.id}
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
