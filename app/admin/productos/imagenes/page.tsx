"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Upload, Search, ImageIcon, X } from "lucide-react"
import { uploadImageToBlob } from "@/lib/image-upload"

interface ProductWithBrand {
  id: number
  codigo: string
  nombre: string
  marca: {
    id: number
    nombre: string
  }
  precio: number
  stock: number
  images?: string[]
}

export default function ProductImagesPage() {
  const [products, setProducts] = useState<ProductWithBrand[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductWithBrand[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<ProductWithBrand | null>(null)
  const [uploadingImages, setUploadingImages] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProductsWithBrand()
  }, [])

  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.marca.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredProducts(filtered)
  }, [searchTerm, products])

  const loadProductsWithBrand = async () => {
    try {
      const response = await fetch("/api/test-zureo-branded-products")
      const data = await response.json()

      if (data.success) {
        setProducts(data.products || [])
        setFilteredProducts(data.products || [])
      }
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadingImages(files)
  }

  const uploadImages = async () => {
    if (!selectedProduct || uploadingImages.length === 0) return

    setIsUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (const file of uploadingImages) {
        // Optimizar imagen
        const optimizedFile = await optimizeImage(file)

        // Subir a Vercel Blob
        const result = await uploadImageToBlob(
          optimizedFile,
          `products/${selectedProduct.codigo}/${Date.now()}-${file.name}`,
        )

        uploadedUrls.push(result.url)
      }

      // Actualizar producto con las nuevas imágenes
      const updatedProduct = {
        ...selectedProduct,
        images: [...(selectedProduct.images || []), ...uploadedUrls],
      }

      // Actualizar en la base de datos local (aquí podrías hacer una llamada a tu API)
      setProducts((prev) => prev.map((p) => (p.id === selectedProduct.id ? updatedProduct : p)))

      setSelectedProduct(updatedProduct)
      setUploadingImages([])

      alert(`${uploadedUrls.length} imágenes subidas exitosamente`)
    } catch (error) {
      console.error("Error uploading images:", error)
      alert("Error subiendo imágenes")
    } finally {
      setIsUploading(false)
    }
  }

  const optimizeImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const img = new Image()

      img.onload = () => {
        // Redimensionar a máximo 800px manteniendo proporción
        const maxSize = 800
        let { width, height } = img

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        } else if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }

        canvas.width = width
        canvas.height = height

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            const optimizedFile = new File([blob!], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            })
            resolve(optimizedFile)
          },
          "image/jpeg",
          0.85,
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const removeImage = (imageUrl: string) => {
    if (!selectedProduct) return

    const updatedProduct = {
      ...selectedProduct,
      images: selectedProduct.images?.filter((url) => url !== imageUrl) || [],
    }

    setSelectedProduct(updatedProduct)
    setProducts((prev) => prev.map((p) => (p.id === selectedProduct.id ? updatedProduct : p)))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos con marca...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Gestión de Imágenes</h1>
        <p className="text-gray-600 mt-2">Sube imágenes para productos que tienen marca asignada</p>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardContent className="pt-6">
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lista de productos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos con Marca ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProduct?.id === product.id
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{product.nombre}</h4>
                      <p className="text-sm text-gray-500">Código: {product.codigo}</p>
                      <Badge variant="outline" className="mt-1">
                        {product.marca.nombre}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${product.precio.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{product.images?.length || 0} imágenes</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Panel de imágenes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {selectedProduct ? `Imágenes - ${selectedProduct.nombre}` : "Selecciona un producto"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProduct ? (
              <div className="space-y-4">
                {/* Imágenes existentes */}
                {selectedProduct.images && selectedProduct.images.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Imágenes actuales</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedProduct.images.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl || "/placeholder.svg"}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(imageUrl)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subir nuevas imágenes */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div>
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-sm font-medium text-gray-900">Subir nuevas imágenes</span>
                      <span className="block text-sm text-gray-500 mt-1">
                        PNG, JPG hasta 10MB (se optimizarán automáticamente)
                      </span>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Preview de imágenes a subir */}
                {uploadingImages.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Imágenes a subir ({uploadingImages.length})</h4>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {uploadingImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file) || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                            {(file.size / 1024 / 1024).toFixed(1)}MB
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button onClick={uploadImages} disabled={isUploading} className="w-full bg-black hover:bg-gray-800">
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Subir {uploadingImages.length} Imágenes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Selecciona un producto para gestionar sus imágenes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
