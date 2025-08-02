"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ZureoProduct {
  codigo: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  subcategoria: string
  genero: string
  tallas: string[]
  colores: string[]
  marca: string
  stock: number
}

export default function SubirProductosPage() {
  const [searchCode, setSearchCode] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<ZureoProduct | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Simulamos productos de Zureo
  const zureoProducts: ZureoProduct[] = [
    {
      codigo: "ZUR001",
      nombre: "Remera Premium Algodón",
      descripcion: "Remera de algodón 100% premium, perfecta para el uso diario",
      precio: 35,
      categoria: "Vestimenta",
      subcategoria: "Remeras",
      genero: "Hombre",
      tallas: ["S", "M", "L", "XL"],
      colores: ["Negro", "Blanco", "Gris"],
      marca: "Premium",
      stock: 25,
    },
    {
      codigo: "ZUR002",
      nombre: "Jean Clásico Denim",
      descripcion: "Jean de corte clásico en denim de alta calidad",
      precio: 85,
      categoria: "Vestimenta",
      subcategoria: "Pantalones",
      genero: "Mujer",
      tallas: ["28", "30", "32", "34"],
      colores: ["Azul", "Negro"],
      marca: "Denim Co",
      stock: 15,
    },
    {
      codigo: "ZUR003",
      nombre: "Gorra Snapback Urban",
      descripcion: "Gorra snapback de estilo urbano con bordado frontal",
      precio: 25,
      categoria: "Accesorios",
      subcategoria: "Gorras",
      genero: "Unisex",
      tallas: ["Única"],
      colores: ["Negro", "Blanco", "Rojo"],
      marca: "Urban Style",
      stock: 30,
    },
  ]

  const searchProduct = async () => {
    if (!searchCode.trim()) return

    setIsSearching(true)

    // Simular búsqueda en Zureo
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const product = zureoProducts.find((p) => p.codigo.toLowerCase() === searchCode.toLowerCase())
    setSelectedProduct(product || null)

    if (!product) {
      alert("Producto no encontrado en Zureo. Verifica el código.")
    }

    setIsSearching(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages([...images, ...files])
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
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

    // Simular subida de producto
    await new Promise((resolve) => setTimeout(resolve, 2000))

    alert(`Producto ${selectedProduct.codigo} subido exitosamente con ${images.length} imágenes!`)

    // Resetear formulario
    setSearchCode("")
    setSelectedProduct(null)
    setImages([])
    setIsUploading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Subir Producto desde Zureo</h1>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">¿Cómo funciona?</h3>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Busca el producto por su código de Zureo</li>
          <li>2. Sube las imágenes del producto</li>
          <li>3. El sistema asociará automáticamente toda la información</li>
        </ol>
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
                <Label htmlFor="searchCode">Código del Producto</Label>
                <Input
                  id="searchCode"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="Ej: ZUR001"
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

            <div className="text-sm text-gray-600">
              <p>
                <strong>Códigos de ejemplo:</strong> ZUR001, ZUR002, ZUR003
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Información del producto encontrado */}
        {selectedProduct && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">✓ Producto Encontrado</CardTitle>
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
                    <span className="ml-2">{selectedProduct.nombre}</span>
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
                    <span className="font-medium text-gray-700">Categoría:</span>
                    <span className="ml-2">
                      {selectedProduct.categoria} → {selectedProduct.subcategoria}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Género:</span>
                    <span className="ml-2">{selectedProduct.genero}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tallas:</span>
                    <span className="ml-2">{selectedProduct.tallas.join(", ")}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Colores:</span>
                    <span className="ml-2">{selectedProduct.colores.join(", ")}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <span className="font-medium text-gray-700">Descripción:</span>
                <p className="mt-1 text-gray-600">{selectedProduct.descripcion}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subida de imágenes */}
        {selectedProduct && (
          <Card>
            <CardHeader>
              <CardTitle>Imágenes del Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="images" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">Subir imágenes del producto</span>
                    <span className="mt-1 block text-sm text-gray-500">PNG, JPG, GIF hasta 10MB cada una</span>
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
                  <h4 className="font-medium mb-3">Imágenes subidas ({images.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file) || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Botón de envío */}
        {selectedProduct && (
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isUploading || images.length === 0}
              className="bg-blue-950 hover:bg-blue-900"
              size="lg"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Subiendo Producto...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Publicar Producto
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
