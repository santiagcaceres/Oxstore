"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Upload, X, Save } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ProductData {
  product_code: string
  custom_title?: string
  custom_description?: string
  seo_title?: string
  seo_description?: string
  tags?: string[]
  is_active?: boolean
  is_featured?: boolean
  gender?: string
  category?: string
  type?: string
}

interface ProductImage {
  id: string
  image_url: string
  is_primary: boolean
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const codigo = params.codigo as string
  const supabase = createClient()

  const [productData, setProductData] = useState<ProductData>({
    product_code: codigo,
    custom_title: "",
    custom_description: "",
    seo_title: "",
    seo_description: "",
    tags: [],
    is_active: true,
    is_featured: false,
    gender: "",
    category: "",
    type: "",
  })

  const [images, setImages] = useState<ProductImage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    loadProductData()
    loadProductImages()
  }, [codigo])

  const loadProductData = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*").eq("product_code", codigo).single()

      if (data) {
        setProductData(data)
      }
    } catch (error) {
      console.error("Error loading product data:", error)
    }
  }

  const loadProductImages = async () => {
    try {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_code", codigo)
        .order("is_primary", { ascending: false })

      if (data) {
        setImages(data)
      }
    } catch (error) {
      console.error("Error loading product images:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from("products").upsert(productData)

      if (!error) {
        alert("Producto guardado exitosamente")
      }
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Error al guardar el producto")
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${codigo}-${Date.now()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath)

      const { error: dbError } = await supabase.from("product_images").insert({
        product_code: codigo,
        image_url: publicUrl,
        file_path: filePath,
        is_primary: images.length === 0,
      })

      if (!dbError) {
        loadProductImages()
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Error al subir la imagen")
    }
  }

  const removeImage = async (imageId: string, filePath: string) => {
    try {
      await supabase.storage.from("product-images").remove([filePath])

      await supabase.from("product_images").delete().eq("id", imageId)

      loadProductImages()
    } catch (error) {
      console.error("Error removing image:", error)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !productData.tags?.includes(newTag.trim())) {
      setProductData({
        ...productData,
        tags: [...(productData.tags || []), newTag.trim()],
      })
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setProductData({
      ...productData,
      tags: productData.tags?.filter((tag) => tag !== tagToRemove) || [],
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver</span>
          </button>
          <h1 className="text-2xl font-bold">Editar Producto: {codigo}</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "Guardando..." : "Guardar"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Información del Producto */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Información Básica</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código (Solo lectura)</label>
                <input
                  type="text"
                  value={codigo}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título Personalizado</label>
                <input
                  type="text"
                  value={productData.custom_title || ""}
                  onChange={(e) => setProductData({ ...productData, custom_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={productData.custom_description || ""}
                  onChange={(e) => setProductData({ ...productData, custom_description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                  <select
                    value={productData.gender || ""}
                    onChange={(e) => setProductData({ ...productData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="hombre">Hombre</option>
                    <option value="mujer">Mujer</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <input
                    type="text"
                    value={productData.type || ""}
                    onChange={(e) => setProductData({ ...productData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="ej: remera, pantalón, etc."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <input
                  type="text"
                  value={productData.category || ""}
                  onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">SEO</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título SEO</label>
                <input
                  type="text"
                  value={productData.seo_title || ""}
                  onChange={(e) => setProductData({ ...productData, seo_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción SEO</label>
                <textarea
                  value={productData.seo_description || ""}
                  onChange={(e) => setProductData({ ...productData, seo_description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Etiquetas</h2>

            <div className="flex flex-wrap gap-2 mb-4">
              {productData.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-2 text-blue-600 hover:text-blue-800">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTag()}
                placeholder="Nueva etiqueta"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={addTag} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Agregar
              </button>
            </div>
          </div>

          {/* Estados */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Estados</h2>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={productData.is_active || false}
                  onChange={(e) => setProductData({ ...productData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Producto activo</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={productData.is_featured || false}
                  onChange={(e) => setProductData({ ...productData, is_featured: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Producto destacado</span>
              </label>
            </div>
          </div>
        </div>

        {/* Imágenes */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Imágenes del Producto</h2>

            <div className="mb-4">
              <label className="flex items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Subir imagen</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.image_url || "/placeholder.svg"}
                    alt="Producto"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  {image.is_primary && (
                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Principal
                    </span>
                  )}
                  <button
                    onClick={() => removeImage(image.id, image.image_url)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
