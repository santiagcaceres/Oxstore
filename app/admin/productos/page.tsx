"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Search, Package, Edit, Star } from "lucide-react"
import { getCompleteProducts, getProductsWithStock, updateProductLocalData } from "@/lib/product-service"
import type { EnrichedProduct } from "@/lib/product-service"
import Image from "next/image"

export default function ProductosPage() {
  const [completeProducts, setCompleteProducts] = useState<EnrichedProduct[]>([])
  const [stockProducts, setStockProducts] = useState<EnrichedProduct[]>([])
  const [filteredComplete, setFilteredComplete] = useState<EnrichedProduct[]>([])
  const [filteredStock, setFilteredStock] = useState<EnrichedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingProduct, setEditingProduct] = useState<EnrichedProduct | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    custom_title: "",
    custom_description: "",
    seo_title: "",
    seo_description: "",
    is_featured: false,
    is_active: true,
  })

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [completeProducts, stockProducts, searchTerm])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const [complete, stock] = await Promise.all([getCompleteProducts(), getProductsWithStock()])

      setCompleteProducts(complete)
      setStockProducts(stock)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    const searchLower = searchTerm.toLowerCase()

    const filterFn = (product: EnrichedProduct) =>
      product.nombre.toLowerCase().includes(searchLower) ||
      product.codigo.toLowerCase().includes(searchLower) ||
      product.marca?.toLowerCase().includes(searchLower)

    setFilteredComplete(completeProducts.filter(filterFn))
    setFilteredStock(stockProducts.filter(filterFn))
  }

  const handleEditProduct = (product: EnrichedProduct) => {
    setEditingProduct(product)
    setFormData({
      custom_title: product.custom_title || "",
      custom_description: product.custom_description || "",
      seo_title: product.seo_title || "",
      seo_description: product.seo_description || "",
      is_featured: product.is_featured || false,
      is_active: product.is_active !== false,
    })
  }

  const handleSaveProduct = async () => {
    if (!editingProduct) return

    setSaving(true)
    try {
      await updateProductLocalData(editingProduct.codigo, formData)
      await loadProducts() // Reload products
      setEditingProduct(null)
    } catch (error) {
      console.error("Error saving product:", error)
    } finally {
      setSaving(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      </div>
    )
  }

  const ProductCard = ({ product }: { product: EnrichedProduct }) => (
    <Card key={product.codigo} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">
              {product.custom_title || product.nombre}
              {product.is_featured && <Star className="inline h-4 w-4 text-yellow-500 ml-1" />}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">Código: {product.codigo}</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Product Image */}
        {product.images && product.images.length > 0 && (
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={product.images[0].image_url || "/placeholder.svg"}
              alt={product.nombre}
              width={200}
              height={200}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Product Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Precio:</span>
            <span className="font-semibold">{formatPrice(product.precio)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Marca:</span>
            <span className="font-medium">{product.marca}</span>
          </div>

          {product.stock !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Stock:</span>
              <span className="font-medium">{product.stock}</span>
            </div>
          )}
        </div>

        {/* Custom Description */}
        {product.custom_description && (
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-600 line-clamp-3">{product.custom_description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm text-green-600">
            Completos: {completeProducts.length}
          </Badge>
          <Badge variant="outline" className="text-sm text-blue-600">
            Con Stock: {stockProducts.length}
          </Badge>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
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

      {/* Tabs */}
      <Tabs defaultValue="complete" className="space-y-4">
        <TabsList>
          <TabsTrigger value="complete">Productos Completos ({filteredComplete.length})</TabsTrigger>
          <TabsTrigger value="stock">Con Stock ({filteredStock.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="complete" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredComplete.map((product) => (
              <ProductCard key={product.codigo} product={product} />
            ))}
          </div>

          {filteredComplete.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay productos completos</h3>
                <p className="text-gray-500">Los productos completos tienen marca, nombre, descripción e imagen</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStock.map((product) => (
              <ProductCard key={product.codigo} product={product} />
            ))}
          </div>

          {filteredStock.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay productos con stock</h3>
                <p className="text-gray-500">No se encontraron productos disponibles</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Producto: {editingProduct?.nombre}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="custom_title">Título Personalizado</Label>
              <Input
                id="custom_title"
                value={formData.custom_title}
                onChange={(e) => setFormData((prev) => ({ ...prev, custom_title: e.target.value }))}
                placeholder={editingProduct?.nombre}
              />
            </div>

            <div>
              <Label htmlFor="custom_description">Descripción Personalizada</Label>
              <Textarea
                id="custom_description"
                value={formData.custom_description}
                onChange={(e) => setFormData((prev) => ({ ...prev, custom_description: e.target.value }))}
                placeholder="Descripción detallada del producto..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="seo_title">Título SEO</Label>
              <Input
                id="seo_title"
                value={formData.seo_title}
                onChange={(e) => setFormData((prev) => ({ ...prev, seo_title: e.target.value }))}
                placeholder="Título optimizado para SEO"
              />
            </div>

            <div>
              <Label htmlFor="seo_description">Descripción SEO</Label>
              <Textarea
                id="seo_description"
                value={formData.seo_description}
                onChange={(e) => setFormData((prev) => ({ ...prev, seo_description: e.target.value }))}
                placeholder="Descripción meta para SEO"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_featured: checked }))}
              />
              <Label htmlFor="is_featured">Producto Destacado</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Producto Activo</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setEditingProduct(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProduct} disabled={saving}>
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
