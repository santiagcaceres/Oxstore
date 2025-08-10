"use client"

import { useState, useEffect, type ChangeEvent } from "react"
import Image from "next/image"
import { Upload, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getBrandsFromZureo } from "@/lib/zureo-api"

interface Brand {
  id: number
  nombre: string
  imageUrl?: string
}

export default function MarcasPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingBrandId, setUploadingBrandId] = useState<number | null>(null)

  useEffect(() => {
    async function loadBrands() {
      try {
        const zureoBrands = await getBrandsFromZureo()
        // Aquí se debería cargar las URLs de las imágenes desde una BBDD o KV store.
        // Por ahora, lo simulamos en el estado.
        const brandsWithImages = zureoBrands
          .filter((b) => b.nombre && b.nombre.trim() !== "")
          .map((b) => ({ ...b, imageUrl: "" }))
        setBrands(brandsWithImages)
      } catch (error) {
        console.error("Error al cargar las marcas:", error)
      } finally {
        setLoading(false)
      }
    }
    loadBrands()
  }, [])

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>, brandId: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingBrandId(brandId)
    const body = new FormData()
    body.append("file", file)
    body.append("type", "brand")

    try {
      const response = await fetch("/api/upload-image", { method: "POST", body })
      const { url } = await response.json()
      setBrands(brands.map((b) => (b.id === brandId ? { ...b, imageUrl: url } : b)))
      // Aquí deberías guardar la URL en tu BBDD asociada a la marca.
    } catch (error) {
      console.error("Error al subir la imagen:", error)
      alert("Error al subir la imagen.")
    } finally {
      setUploadingBrandId(null)
    }
  }

  const handleRemoveImage = (brandId: number) => {
    setBrands(brands.map((b) => (b.id === brandId ? { ...b, imageUrl: "" } : b)))
    // Aquí deberías eliminar la URL de tu BBDD.
  }

  if (loading) {
    return <div>Cargando marcas...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestión de Logos de Marcas</h1>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Marcas de Zureo</h2>
        </div>
        <div className="divide-y">
          {brands.map((brand) => (
            <div key={brand.id} className="p-4 flex items-center justify-between">
              <span className="font-medium">{brand.nombre}</span>
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-24 bg-gray-100 rounded-md overflow-hidden border">
                  {brand.imageUrl ? (
                    <Image
                      src={brand.imageUrl || "/placeholder.svg"}
                      alt={`Logo de ${brand.nombre}`}
                      fill
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-gray-500">Sin logo</div>
                  )}
                </div>
                {brand.imageUrl && (
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveImage(brand.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
                <Button asChild variant="outline" size="sm" disabled={uploadingBrandId === brand.id}>
                  <label htmlFor={`upload-${brand.id}`} className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingBrandId === brand.id ? "Subiendo..." : "Subir Logo"}
                  </label>
                </Button>
                <input
                  id={`upload-${brand.id}`}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, brand.id)}
                  accept="image/*"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
