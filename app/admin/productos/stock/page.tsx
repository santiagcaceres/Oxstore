"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Edit, Eye, ImageIcon } from "lucide-react"
import { getProductsWithStock, upsertLocalProduct, type EnhancedProduct } from "@/lib/product-manager"
import Link from "next/link"
import Image from "next/image"

export default function ProductosStockPage() {
  const [products, setProducts] = useState<EnhancedProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<EnhancedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [editData, setEditData] = useState({
    custom_title: "",
    custom_description: "",
    is_featured: false,
  })

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(
        (product) =>
          product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.marca?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const productsData = await getProductsWithStock()
      setProducts(productsData)
      setFilteredProducts(productsData)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: EnhancedProduct) => {
    setEditingProduct(product.codigo)
    setEditData({
      custom_title: product.custom_title || "",
      custom_description: product.custom_description || "",
      is_featured: product.is_featured || false,
    })
  }

  const handleSave = async (productCode: string) => {
    try {
      await upsertLocalProduct({
        product_code: productCode,
        ...editData,
      })

      setEditingProduct(null)
      await loadProducts()

      // Mostrar notificación de éxito
      alert("Producto actualizado exitosamente")
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Error al guardar el producto")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">Productos con Stock</h1>
          <p className="text-gray-600">Gestiona productos que tienen stock disponible</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Package className="h-4 w-4 mr-2" />
          {filteredProducts.length} productos
        </Badge>
      </div>

      {/* Barra de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por código, nombre o marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de productos */}
      <div className="grid gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.codigo} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex gap-6">
                {/* Imagen del producto */}
                <div className="flex-shrink-0">
                  {product.images.length > 0 ? (
                    <Image
                      src={product.images[0].image_url || "/placeholder.svg"}
                      alt={product.custom_title || product.nombre || "Producto"}
                      width={120}
                      height={120}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-30 h-30 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Información del producto */}
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono">
                          {product.codigo}
                        </Badge>
                        {product.is_featured && <Badge className="bg-yellow-500">Destacado</Badge>}
                        <Badge variant="secondary">Stock: {product.stock}</Badge>
                      </div>

                      {editingProduct === product.codigo ? (
                        <div className="space-y-2">
                          <Input
                            placeholder="Título personalizado"
                            value={editData.custom_title}
                            onChange={(e) => setEditData({ ...editData, custom_title: e.target.value })}
                          />
                          <textarea
                            placeholder="Descripción personalizada"
                            value={editData.custom_description}
                            onChange={(e) => setEditData({ ...editData, custom_description: e.target.value })}
                            className="w-full p-2 border rounded-md resize-none"
                            rows={3}
                          />
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editData.is_featured}
                              onChange={(e) => setEditData({ ...editData, is_featured: e.target.checked })}
                            />
                            Producto destacado
                          </label>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-semibold text-lg">
                            {product.custom_title || product.nombre || `Producto ${product.codigo}`}
                          </h3>
                          {product.custom_description && (
                            <p className="text-gray-600 mt-1">{product.custom_description}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-black">${product.precio}</div>
                      {product.marca && <div className="text-sm text-gray-500">{product.marca.nombre}</div>}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    {editingProduct === product.codigo ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSave(product.codigo)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Guardar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingProduct(null)}>
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Link href={`/admin/productos/subir?code=${product.codigo}`}>
                          <Button size="sm" variant="outline">
                            <ImageIcon className="h-4 w-4 mr-1" />
                            Imágenes ({product.images.length})
                          </Button>
                        </Link>
                        <Link href={`/producto/${product.codigo}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron productos</h3>
            <p className="text-gray-600">
              {searchTerm ? "Intenta con otros términos de búsqueda" : "No hay productos con stock disponible"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
