"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Upload, Trash2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { uploadBannerImage, getBanners, deleteBanner } from "@/lib/supabase"

interface Banner {
  id: string
  image_url: string
  file_path: string
  is_active: boolean
  created_at: string
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      const data = await getBanners()
      setBanners(data)
    } catch (error) {
      console.error("Error loading banners:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      await uploadBannerImage(file)
      await loadBanners() // Recargar la lista
    } catch (error) {
      console.error("Error uploading banner:", error)
      alert("Error al subir el banner.")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteBanner = async (banner: Banner) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este banner?")) return

    try {
      await deleteBanner(banner.id, banner.file_path)
      setBanners(banners.filter((b) => b.id !== banner.id))
    } catch (error) {
      console.error("Error deleting banner:", error)
      alert("Error al eliminar el banner.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Cargando banners...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Banners</h1>

        <div className="relative">
          <Button disabled={uploading} asChild>
            <label htmlFor="upload-banner" className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Subiendo..." : "Subir Banner"}
            </label>
          </Button>
          <input
            id="upload-banner"
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="relative h-48">
              <Image src={banner.image_url || "/placeholder.svg"} alt="Banner" fill className="object-cover" />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{new Date(banner.created_at).toLocaleDateString()}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteBanner(banner)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No hay banners subidos</p>
          <p className="text-sm text-gray-400 mt-2">Sube tu primer banner usando el botón de arriba</p>
        </div>
      )}
    </div>
  )
}
