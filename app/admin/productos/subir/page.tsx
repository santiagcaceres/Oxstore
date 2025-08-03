"use client"

import type React from "react"
import { useState } from "react"
import { Upload, X, Search, ImageIcon, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getProductsFromZureo, uploadProductImage } from "@/lib/zureo-api"
import { uploadImageToBlob, optimizeImage } from "@/lib/image-upload"
import type { ZureoProduct } from "@/types/zureo"

interface UploadedImage {
  file: File
  preview: string
  uploaded: boolean
  blobUrl?: string
}

export default function SubirProductosPage() {
  const [searchCode, setSearchCode] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<ZureoProduct | null>(null)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const searchProduct = async () => {
    if (!searchCode.trim()) return

    setIsSearching(true)

    try {
      // Buscar en productos reales de Zureo
      const products = await getProductsFromZureo({ qty: 1000, includeInactive: true })
      const product = products.find(
        (p) =>
          p.codigo.toLowerCase().includes(searchCode.toLowerCase()) ||
          p.nombre?.toLowerCase().includes(searchCode.toLowerCase()),
      )

      setSelectedProduct(product || null)

      if (!product) {
        alert("Producto no encontrado en Zureo. Verifica el código o nombre.")
      }
    } catch (error) {
      console.error("Error buscando producto:", error)
      alert("Error al buscar el producto. Verifica tu conexión.")
    }

    setIsSearching(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    for (const file of files) {
      // Optimizar imagen antes de subirla
      const optimizedFile = await optimizeImage(file, 800, 0.85)

      const uploadedImage: UploadedImage = {
        file: optimizedFile,
        preview: URL.createObjectURL(optimizedFile),
        uploaded: false,
      }

      setImages((prev) => [...prev, uploadedImage])
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
  }

  const uploadSingleImage = async (imageIndex: number) => {
    if (!selectedProduct) return

    const image = images[imageIndex]
    if (image.uploaded) return

    try {
      // Subir a Vercel Blob para optimización
      const blobResult = await uploadImageToBlob(image.file, `products/${selectedProduct.codigo}`)

      // También subir a Zureo si es necesario
      await uploadProductImage(String(selectedProduct.id), image.file)

      // Actualizar estado
      setImages((prev) =>
        prev.map((img, i) => (i === imageIndex ? { ...img, uploaded: true, blobUrl: blobResult.url } : img)),
      )

      alert(`Imagen ${imageIndex + 1} subida exitosamente!`)
    } catch (error) {
      console.error("Error subiendo imagen:", error)
      alert(`Error subiendo imagen ${imageIndex + 1}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProduct) {
      alert("Primero busca un producto en Zureo")
      return
    }

    if (images.length === 0) {
      alert("Debes subir al menos una imagen")
      return
    }

    setIsUploading(true)

    try {
      // Subir todas las imágenes que no estén subidas
      for (let i = 0; i < images.length; i++) {
        if (!images[i].uploaded) {
          await uploadSingleImage(i)
        }
      }

      alert(`¡Todas las imágenes del producto ${selectedProduct.codigo} fueron subidas exitosamente!`)

      // Resetear formulario
      setSearchCode("")
      setSelectedProduct(null)
      setImages([])
    } catch (error) {
      console.error("Error en el proceso de subida:", error)
      alert("Hubo un error subiendo algunas imágenes")
    }

    setIsUploading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Subir Imágenes de Productos</h1>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Sistema Optimizado de Imágenes</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Las imágenes se optimizan automáticamente para web</li>
          <li>• Se suben a Vercel Blob para máxima velocidad</li>
          <li>• También se sincronizan con tu sistema Zureo</li>
          <li>• Formatos soportados: JPG, PNG, WebP</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Búsqueda de producto */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Producto en Zureo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="searchCode">Código o Nombre del Producto</Label>
                <Input
                  id="searchCode"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="Ej: 00346980021 o nombre del producto"
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={searchProduct}
                  disabled={isSearching || !searchCode.trim()}
                  className="bg-blue-950 hover:bg-blue-900"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del producto encontrado */}
        {selectedProduct && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                <Check className="h-5 w-5" />
                Producto Encontrado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Código:</span>
                    <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">{selectedProduct.codigo}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Nombre:</span>
                    <span className="ml-2">{selectedProduct.nombre || `Producto ${selectedProduct.codigo}`}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Precio:</span>
                    <span className="ml-2 font-bold text-blue-950">${selectedProduct.precio}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Stock:</span>
                    <span className="ml-2">{selectedProduct.stock} unidades</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Marca:</span>
                    <span className="ml-2">{selectedProduct.marca?.nombre || "Sin marca"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Categoría:</span>
                    <span className="ml-2">{selectedProduct.tipo?.nombre || "Sin categoría"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Estado:</span>
                    {selectedProduct.baja ? (
                      <Badge variant="destructive" className="ml-2">
                        Dado de baja
                      </Badge>
                    ) : (
                      <Badge variant="default" className="ml-2 bg-green-600">
                        Activo
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {selectedProduct.descripcion_larga && (
                <div className="mt-4">
                  <span className="font-medium text-gray-700">Descripción:</span>
                  <p className="mt-1 text-gray-600">{selectedProduct.descripcion_larga}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Subida de imágenes */}
        {selectedProduct && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Imágenes del Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="images" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">Subir imágenes del producto</span>
                    <span className="mt-1 block text-sm text-gray-500">
                      PNG, JPG, WebP hasta 10MB cada una (se optimizarán automáticamente)
                    </span>
                  </Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {images.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Imágenes ({images.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.preview || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />

                        {/* Estado de subida */}
                        <div className="absolute top-2 left-2">
                          {image.uploaded ? (
                            <Badge className="bg-green-600 text-white">
                              <Check className="h-3 w-3 mr-1" />
                              Subida
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pendiente</Badge>
                          )}
                        </div>

                        {/* Botón eliminar */}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>

                        {/* Botón subir individual */}
                        {!image.uploaded && (
                          <Button
                            type="button"
                            size="sm"
                            className="absolute bottom-2 right-2 h-6 px-2 text-xs"
                            onClick={() => uploadSingleImage(index)}
                          >
                            Subir
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Botón de envío */}
        {selectedProduct && images.length > 0 && (
          <div className="flex justify-end">
            <Button type="submit" disabled={isUploading} className="bg-blue-950 hover:bg-blue-900" size="lg">
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Subiendo Todas las Imágenes...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Todas las Imágenes
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
