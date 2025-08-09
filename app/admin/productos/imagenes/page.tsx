"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, Check } from "lucide-react"
import Image from "next/image"

interface Product {
  id: number
  codigo: string
  nombre: string
  marca: {
    id: number
    nombre: string
  }
  precio: number
}

export default function ProductImagesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBrandedProducts()
  }, [])

  const fetchBrandedProducts = async () => {
    try {
      const response = await fetch("/api/test-zureo-branded-products")
      const data = await response.json()
      if (data.success) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))
    setImages((prev) => [...prev, ...imageFiles])
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async () => {
    if (!selectedProduct || images.length === 0) return

    setUploading(true)
    setMessage("")

    try {
      const uploadPromises = images.map(async (image) => {
        const formData = new FormData()
        formData.append("file", image)
        formData.append("productCode", selectedProduct.codigo)

        const response = await fetch("/api/upload-product-image", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Error uploading ${image.name}`)
        }

        return response.json()
      })

      await Promise.all(uploadPromises)
      setMessage("Imágenes subidas exitosamente")
      setImages([])
    } catch (error) {
      setMessage("Error al subir las imágenes")
      console.error("Upload error:", error)
    } finally {
      setUploading(false)
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
      <div>
        <h1 className="text-3xl font-bold text-black">Gestión de Imágenes</h1>
        <p className="text-gray-600">Sube imágenes para productos con marca asignada</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Producto</CardTitle>
          <CardDescription>Solo productos con marca pueden tener imágenes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="product">Producto</Label>
            <Select
              onValueChange={(value) => {
                const product = products.find((p) => p.codigo === value)
                setSelectedProduct(product || null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un producto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.codigo} value={product.codigo}>
                    {product.nombre} - {product.marca.nombre} (${product.precio})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProduct && (
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>
                Producto seleccionado: <strong>{selectedProduct.nombre}</strong> - Marca:{" "}
                <strong>{selectedProduct.marca.nombre}</strong>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {selectedProduct && (
        <Card>
          <CardHeader>
            <CardTitle>Subir Imágenes</CardTitle>
            <CardDescription>Selecciona las imágenes para el producto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="images">Imágenes</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="cursor-pointer"
              />
            </div>

            {images.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Imágenes seleccionadas ({images.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={URL.createObjectURL(image) || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <p className="text-xs text-gray-500 mt-1 truncate">{image.name}</p>
                    </div>
                  ))}
                </div>

                <Button onClick={uploadImages} disabled={uploading} className="w-full">
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Subir {images.length} imagen{images.length > 1 ? "es" : ""}
                    </>
                  )}
                </Button>
              </div>
            )}

            {message && (
              <Alert
                className={message.includes("Error") ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}
              >
                <AlertDescription className={message.includes("Error") ? "text-red-700" : "text-green-700"}>
                  {message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
