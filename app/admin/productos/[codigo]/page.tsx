"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Upload, X, Save, AlertCircle, CheckCircle } from "lucide-react"
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
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [uploadingImage, setUploadingImage] = useState(false)

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
      console.log("[v0] Loading product data for code:", codigo)
      const { data, error } = await supabase.from("products").select("*").eq("product_code", codigo).single()

      if (error) {
        console.log("[v0] Supabase error loading product:", error)
        if (error.code === "PGRST116") {
          // No rows returned - this is fine, we'll create a new product
          console.log("[v0] Product not found, will create new one")
        } else {
          setError(`Error cargando producto: ${error.message}`)
        }
      } else if (data) {
        console.log("[v0] Product data loaded:", data)
        setProductData(data)
      }
    } catch (error) {
      console.error("[v0] Error loading product data:", error)
      setError("Error inesperado cargando el producto")
    }
  }

  const loadProductImages = async () => {
    try {
      console.log("[v0] Loading product images for code:", codigo)
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_code", codigo)
        .order("is_primary", { ascending: false })

      if (error) {
        console.log("[v0] Error loading images:", error)
        setError(`Error cargando imágenes: ${error.message}`)
      } else if (data) {
        console.log("[v0] Images loaded:", data.length, "images")
        setImages(data)
      }
    } catch (error) {
      console.error("[v0] Error loading product images:", error)
      setError("Error inesperado cargando imágenes")
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      console.log("[v0] Loading categories")
      const { data, error } = await supabase.from("product_categories").select("*").order("name")
      if (error) {
        console.log("[v0] Error loading categories:", error)
        setError(`Error cargando categorías: ${error.message}`)
      } else if (data) {
        console.log("[v0] Categories loaded:", data.length, "categories")
        setCategories(data)
      }
    } catch (error) {
      console.error("[v0] Error loading categories:", error)
      setError("Error inesperado cargando categorías")
    }
  }

  const loadSubcategories = async () => {
    try {
      console.log("[v0] Loading subcategories")
      const { data, error } = await supabase.from("product_subcategories").select("*").order("name")
      if (error) {
        console.log("[v0] Error loading subcategories:", error)
        setError(`Error cargando subcategorías: ${error.message}`)
      } else if (data) {
        console.log("[v0] Subcategories loaded:", data.length, "subcategories")
        setSubcategories(data)
      }
    } catch (error) {
      console.error("[v0] Error loading subcategories:", error)
      setError("Error inesperado cargando subcategorías")
    }
  }

  const handleSave = async () => {
    // Clear previous messages
    setError("")
    setSuccess("")

    // Validation
    if (!productData.custom_title?.trim()) {
      setError("El nombre del producto es requerido")
      return
    }

    setSaving(true)
    try {
      console.log("[v0] Saving product data:", productData)

      const { data, error } = await supabase
        .from("products")
        .upsert(productData, {
          onConflict: "product_code",
        })
        .select()

      if (error) {
        console.log("[v0] Supabase error saving product:", error)
        if (error.message.includes("row-level security policy")) {
          setError(
            "Error de permisos: No tienes autorización para guardar productos. Verifica la configuración de seguridad.",
          )
        } else {
          setError(`Error guardando producto: ${error.message}`)
        }
      } else {
        console.log("[v0] Product saved successfully:", data)
        setSuccess("Producto guardado exitosamente")
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (error) {
      console.error("[v0] Error saving product:", error)
      setError("Error inesperado guardando el producto")
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Clear previous messages
    setError("")
    setSuccess("")

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona un archivo de imagen válido")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen debe ser menor a 5MB")
      return
    }

    setUploadingImage(true)
    try {
      console.log("[v0] Uploading image:", file.name, "Size:", file.size)

      const fileExt = file.name.split(".").pop()
      const fileName = `${codigo}-${Date.now()}.${fileExt}`
      const filePath = `products/${fileName}`

      console.log("[v0] Upload path:", filePath)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.log("[v0] Upload error:", uploadError)
        if (uploadError.message.includes("Bucket not found")) {
          setError("Error de configuración: El bucket de imágenes no existe. Por favor contacta al administrador.")
        } else {
          setError(`Error subiendo imagen: ${uploadError.message}`)
        }
        return
      }

      console.log("[v0] Image uploaded successfully:", uploadData)

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath)

      console.log("[v0] Public URL:", publicUrl)

      const { data: dbData, error: dbError } = await supabase
        .from("product_images")
        .insert({
          product_code: codigo,
          image_url: publicUrl,
          file_path: filePath,
          is_primary: images.length === 0,
        })
        .select()

      if (dbError) {
        console.log("[v0] Database error:", dbError)
        if (dbError.message.includes("row-level security policy")) {
          setError(
            "Error de permisos: No tienes autorización para guardar imágenes. Verifica la configuración de seguridad.",
          )
        } else {
          setError(`Error guardando imagen en base de datos: ${dbError.message}`)
        }
        // Try to clean up uploaded file
        await supabase.storage.from("product-images").remove([filePath])
      } else {
        console.log("[v0] Image saved to database:", dbData)
        setSuccess("Imagen subida exitosamente")
        setTimeout(() => setSuccess(""), 3000)
        loadProductImages()
      }
    } catch (error) {
      console.error("[v0] Error uploading image:", error)
      setError("Error inesperado subiendo la imagen")
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = async (imageId: string, filePath: string) => {
    setError("")
    setSuccess("")

    try {
      console.log("[v0] Removing image:", imageId, filePath)

      // Remove from storage
      const { error: storageError } = await supabase.storage.from("product-images").remove([filePath])
      if (storageError) {
        console.log("[v0] Storage removal error:", storageError)
        setError(`Error eliminando archivo: ${storageError.message}`)
        return
      }

      // Remove from database
      const { error: dbError } = await supabase.from("product_images").delete().eq("id", imageId)
      if (dbError) {
        console.log("[v0] Database removal error:", dbError)
        setError(`Error eliminando imagen de base de datos: ${dbError.message}`)
      } else {
        console.log("[v0] Image removed successfully")
        setSuccess("Imagen eliminada exitosamente")
        setTimeout(() => setSuccess(""), 3000)
        loadProductImages()
      }
    } catch (error) {
      console.error("[v0] Error removing image:", error)
      setError("Error inesperado eliminando la imagen")
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

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Producto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={productData.custom_title || ""}
                  onChange={(e) => setProductData({ ...productData, custom_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingrese el nombre del producto"
                  required
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
              <label
                className={`flex items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 ${uploadingImage ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex flex-col items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">{uploadingImage ? "Subiendo..." : "Subir imagen"}</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.image_url || "/placeholder.svg"}
                    alt="Producto"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      console.log("[v0] Image load error:", image.image_url)
                      e.currentTarget.src = "/placeholder.svg"
                    }}
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
