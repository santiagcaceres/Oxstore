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
  is_active?: boolean
  is_featured?: boolean
  gender?: string
  season?: string
  category?: string
  subcategory?: string
}

interface ProductImage {
  id: string
  image_url: string
  is_primary: boolean
  file_path: string
}

interface Category {
  id: string
  name: string
}

interface Subcategory {
  id: string
  name: string
  category_id: string
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
    is_active: true,
    is_featured: false,
    gender: "",
    season: "",
    category: "",
    subcategory: "",
  })

  const [images, setImages] = useState<ProductImage[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProductData()
    loadProductImages()
    loadCategories()
    loadSubcategories()
  }, [codigo])

  useEffect(() => {
    if (productData.category) {
      const categoryObj = categories.find((cat) => cat.name === productData.category)
      if (categoryObj) {
        const filtered = subcategories.filter((sub) => sub.category_id === categoryObj.id)
        setFilteredSubcategories(filtered)
      }
    } else {
      setFilteredSubcategories([])
    }
  }, [productData.category, categories, subcategories])

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

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase.from("product_categories").select("*").order("name")
      if (data) {
        setCategories(data)
      }
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const loadSubcategories = async () => {
    try {
      const { data, error } = await supabase.from("product_subcategories").select("*").order("name")
      if (data) {
        setSubcategories(data)
      }
    } catch (error) {
      console.error("Error loading subcategories:", error)
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

  const handleCategoryChange = (categoryName: string) => {
    setProductData({
      ...productData,
      category: categoryName,
      subcategory: "", // Reset subcategory when category changes
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  value={productData.custom_title || ""}
                  onChange={(e) => setProductData({ ...productData, custom_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingrese el nombre del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={productData.custom_description || ""}
                  onChange={(e) => setProductData({ ...productData, custom_description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción detallada del producto"
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
                    <option value="">Seleccionar género</option>
                    <option value="hombre">Hombre</option>
                    <option value="mujer">Mujer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temporada</label>
                  <select
                    value={productData.season || ""}
                    onChange={(e) => setProductData({ ...productData, season: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar temporada</option>
                    <option value="verano">Verano</option>
                    <option value="invierno">Invierno</option>
                    <option value="todo_el_año">Todo el año</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={productData.category || ""}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoría</label>
                  <select
                    value={productData.subcategory || ""}
                    onChange={(e) => setProductData({ ...productData, subcategory: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={!productData.category}
                  >
                    <option value="">Seleccionar subcategoría</option>
                    {filteredSubcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.name}>
                        {subcategory.name.charAt(0).toUpperCase() + subcategory.name.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
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
                    onClick={() => removeImage(image.id, image.file_path)}
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
