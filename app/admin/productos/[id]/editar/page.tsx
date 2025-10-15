"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, Save, ArrowLeft, AlertCircle, Star, GripVertical } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: number
  zureo_id: number
  zureo_code: string
  name: string
  description: string
  price: number
  precio_zureo?: number
  categoria_zureo?: string
  stock_quantity: number
  category: string
  brand: string
  image_url: string
  is_featured: boolean
  zureo_data: string | object
  created_at: string
  updated_at: string
  sale_price?: number
  discount_percentage?: number
  gender?: string
  subcategory?: string
  custom_name?: string
  custom_description?: string
}

interface Brand {
  id: number
  name: string
  slug: string
}

interface Category {
  id: number
  name: string
  slug: string
  parent_id?: number
  level: number
}

interface Subcategory {
  id: number
  name: string
  slug: string
  category_id: number
  gender: string
  is_active: boolean
}

interface ProductImage {
  id: number
  product_id: number
  image_url: string
  alt_text: string
  sort_order: number
  is_primary: boolean
}

interface ProductVariant {
  id: number
  zureo_code: string
  color: string | null
  size: string | null
  stock_quantity: number
  price: number
  image_url: string | null
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customName, setCustomName] = useState("")
  const [customDescription, setCustomDescription] = useState("")
  const [customPrice, setCustomPrice] = useState("")
  const [salePrice, setSalePrice] = useState("")
  const [discountPercentage, setDiscountPercentage] = useState("")
  const [isOnSale, setIsOnSale] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState("")
  const [selectedGender, setSelectedGender] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSubcategory, setSelectedSubcategory] = useState("")
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState("")
  const [isFeatured, setIsFeatured] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedColorForUpload, setSelectedColorForUpload] = useState("")
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [loadingVariants, setLoadingVariants] = useState(false)
  const [totalStock, setTotalStock] = useState(0)

  const [availableColors, setAvailableColors] = useState<string[]>([])

  // Added state for drag and drop
  const [draggedImageId, setDraggedImageId] = useState<number | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const genderOptions = [
    { value: "hombre", label: "Hombre" },
    { value: "mujer", label: "Mujer" },
    { value: "unisex", label: "Unisex" },
  ]

  const getMainCategories = () => categories.filter((cat) => cat.level === 1)
  const getSubcategories = (categorySlug: string) => {
    console.log(`[v0] Getting subcategories for category: ${categorySlug}`)
    console.log(`[v0] Available subcategories:`, subcategories)

    const filtered = subcategories.filter((subcat) => {
      const matchesCategory = subcat.category_id === categories.find((cat) => cat.slug === categorySlug)?.id

      // Si el género seleccionado es unisex, mostrar subcategorías de todos los géneros
      let matchesGender = true
      if (selectedGender) {
        if (selectedGender === "unisex") {
          // Para unisex, mostrar subcategorías de hombre, mujer y unisex
          matchesGender = ["hombre", "mujer", "unisex"].includes(subcat.gender)
        } else {
          // Para géneros específicos, mostrar ese género y unisex
          matchesGender = subcat.gender === selectedGender || subcat.gender === "unisex"
        }
      }

      return matchesCategory && matchesGender && subcat.is_active
    })

    const uniqueSubcategories = filtered.reduce((acc, current) => {
      const existingIndex = acc.findIndex((item) => item.name === current.name)
      if (existingIndex === -1) {
        acc.push(current)
      } else {
        // Si ya existe, mantener el que tenga prioridad (unisex > género específico)
        const existing = acc[existingIndex]
        if (current.gender === "unisex" && existing.gender !== "unisex") {
          acc[existingIndex] = current
        }
      }
      return acc
    }, [] as Subcategory[])

    console.log(`[v0] Filtered and deduplicated subcategories:`, uniqueSubcategories)
    return uniqueSubcategories
  }
  const getSubSubcategories = (parentSlug: string) => {
    const parent = categories.find((cat) => cat.slug === parentSlug && cat.level === 2)
    return parent ? categories.filter((cat) => cat.parent_id === parent.id && cat.level === 3) : []
  }

  const setPrimaryImage = async (imageId: number) => {
    try {
      console.log("[v0] Setting primary image:", imageId)

      const { error: unmarkError } = await supabase
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", params.id)

      if (unmarkError) {
        console.error("[v0] Error unmarking images:", unmarkError)
        throw new Error(`Error al desmarcar imágenes: ${unmarkError.message}`)
      }

      const { error: updateError } = await supabase
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", imageId)

      if (updateError) {
        console.error("[v0] Database update error:", updateError)
        throw new Error(`Error al marcar imagen como principal: ${updateError.message}`)
      }

      const selectedImage = productImages.find((img) => img.id === imageId)
      if (selectedImage) {
        const { error: productUpdateError } = await supabase
          .from("products_in_stock")
          .update({ image_url: selectedImage.image_url })
          .eq("id", params.id)

        if (productUpdateError) {
          console.error("[v0] Error updating product image_url:", productUpdateError)
        }
      }

      await loadProductImages()

      toast({
        title: "✓ Imagen principal actualizada",
        description: "La imagen ha sido marcada como principal correctamente",
        className: "bg-green-50 border-green-200",
      })

      console.log("[v0] Image marked as primary successfully")
    } catch (error) {
      console.error("[v0] Set primary image error:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al marcar imagen como principal"
      setError(errorMessage)

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    console.log("[v0] Edit product page loaded with params:", params)
    loadProduct()
    loadBrandsData()
    loadCategoriesData()
    loadSubcategoriesData()
    loadProductImages()
  }, [params])

  const loadCategoriesData = async () => {
    try {
      console.log("[v0] Loading categories data...")
      const { data, error } = await supabase.from("categories").select("*").eq("is_active", true).order("sort_order")

      if (error) throw error
      console.log("[v0] Successfully loaded categories:", data?.length || 0)

      data?.forEach((cat) => {
        console.log(`[v0] Category: ${cat.name} (Level: ${cat.level}, Parent: ${cat.parent_id}, Slug: ${cat.slug})`)
      })

      setCategories(data || [])
    } catch (error) {
      console.error("[v0] Error loading categories:", error)
    }
  }

  const loadSubcategoriesData = async () => {
    try {
      console.log("[v0] Loading subcategories data...")
      const { data, error } = await supabase.from("subcategories").select("*").eq("is_active", true).order("name")

      if (error) throw error
      console.log("[v0] Successfully loaded subcategories:", data?.length || 0)

      data?.forEach((subcat) => {
        console.log(
          `[v0] Subcategory: ${subcat.name} (Category ID: ${subcat.category_id}, Gender: ${subcat.gender}, Slug: ${subcat.slug})`,
        )
      })

      setSubcategories(data || [])
    } catch (error) {
      console.error("[v0] Error loading subcategories:", error)
    }
  }

  const loadProductImages = async () => {
    try {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", params.id)
        .order("sort_order")

      if (error) throw error
      setProductImages(data || [])
    } catch (error) {
      console.error("Error cargando imágenes:", error)
    }
  }

  const loadVariants = async (zureoCode: string) => {
    try {
      setLoadingVariants(true)
      console.log("[v0] Loading variants for zureo_code:", zureoCode)

      const { data, error } = await supabase
        .from("products_in_stock")
        .select("id, zureo_code, color, size, stock_quantity, price, image_url")
        .eq("zureo_code", zureoCode)
        .order("color")
        .order("size")

      if (error) throw error

      console.log("[v0] Loaded variants:", data?.length || 0)
      setVariants(data || [])

      const total = data?.reduce((sum, variant) => sum + variant.stock_quantity, 0) || 0
      setTotalStock(total)
      console.log("[v0] Total stock calculated:", total)

      const colors = [...new Set(data?.map((v) => v.color).filter(Boolean) as string[])]
      setAvailableColors(colors)
      if (colors.length > 0 && !selectedColorForUpload) {
        setSelectedColorForUpload(colors[0])
      }
    } catch (error) {
      console.error("[v0] Error loading variants:", error)
    } finally {
      setLoadingVariants(false)
    }
  }

  const loadProduct = async () => {
    try {
      setLoading(true)
      console.log("[v0] Loading product with ID:", params.id)
      const response = await fetch(`/api/admin/products/${params.id}`)

      if (!response.ok) {
        console.error("[v0] Failed to load product:", response.status, response.statusText)
        throw new Error("Producto no encontrado")
      }

      const data = await response.json()
      const prod = data.product

      console.log("[v0] Product loaded successfully:", prod)
      console.log("[v0] Zureo data:", prod.zureo_data)

      let zureoPrice = prod.price || 0
      if (prod.zureo_data) {
        try {
          const zureoData = typeof prod.zureo_data === "string" ? JSON.parse(prod.zureo_data) : prod.zureo_data
          console.log("[v0] Parsed zureo data:", zureoData)

          if (zureoData.precio || zureoData.price) {
            const originalPrice = Number(zureoData.precio || zureoData.price)
            zureoPrice = Math.round(originalPrice * 1.22)
            console.log("[v0] Original Zureo price:", originalPrice)
            console.log("[v0] Price with 1.22 multiplier:", zureoPrice)
          }
        } catch (error) {
          console.error("[v0] Error parsing zureo_data:", error)
        }
      }

      setProduct(prod)
      setCustomName(prod.custom_name || prod.name || "")
      setCustomDescription(prod.custom_description || prod.description || "")
      setCustomPrice(zureoPrice.toString())
      setSalePrice(prod.sale_price?.toString() || "")
      setDiscountPercentage(prod.discount_percentage?.toString() || "")
      setIsOnSale(!!prod.sale_price || !!prod.discount_percentage)
      setSelectedBrand(prod.brand || "")
      setSelectedGender(prod.gender || "")
      setSelectedCategory(prod.category || "")
      setSelectedSubcategory(prod.subcategory || "")
      setIsFeatured(prod.is_featured || false)

      if (prod.zureo_code) {
        loadVariants(prod.zureo_code)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const loadBrandsData = async () => {
    try {
      console.log("[v0] Loading brands data...")
      const { data, error } = await supabase.from("brands").select("*").order("name")

      if (error) {
        console.error("[v0] Error loading brands:", error)
        throw error
      }

      console.log("[v0] Successfully loaded brands:", data?.length || 0)
      console.log("[v0] Brands data:", data)
      setBrands(data || [])
    } catch (error) {
      console.error("[v0] Exception loading brands:", error)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    if (availableColors.length > 0 && !selectedColorForUpload) {
      setError("Por favor selecciona un color antes de subir imágenes")
      toast({
        title: "Selecciona un color",
        description: "Por favor selecciona un color antes de subir imágenes",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)
      setError(null)

      let variantIdsForColor: number[] = [Number.parseInt(params.id, 10)]

      if (selectedColorForUpload && product?.zureo_code) {
        const { data: colorVariants, error: variantsError } = await supabase
          .from("products_in_stock")
          .select("id")
          .eq("zureo_code", product.zureo_code)
          .eq("color", selectedColorForUpload)

        if (!variantsError && colorVariants && colorVariants.length > 0) {
          variantIdsForColor = colorVariants.map((v) => v.id)
          console.log(`[v0] Found ${variantIdsForColor.length} variants for color ${selectedColorForUpload}`)
        }
      }

      let successCount = 0

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        if (!file.type.startsWith("image/")) {
          throw new Error(`El archivo ${file.name} no es una imagen válida`)
        }

        const fileExt = file.name.split(".").pop()?.toLowerCase()
        const fileName = `product-${params.id}-${selectedColorForUpload || "default"}-${Date.now()}-${i}.${fileExt}`
        const filePath = `products/${fileName}`

        console.log("[v0] Uploading file:", fileName, "Size:", file.size)

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file, {
            upsert: true,
            contentType: file.type,
          })

        if (uploadError) {
          console.error("[v0] Storage upload error:", uploadError)
          throw new Error(`Error al subir ${file.name}: ${uploadError.message}`)
        }

        console.log("[v0] Upload successful:", uploadData)

        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath)

        if (!urlData?.publicUrl) {
          throw new Error(`No se pudo obtener la URL pública para ${file.name}`)
        }

        console.log("[v0] Public URL obtained:", urlData.publicUrl)

        const imageInserts = variantIdsForColor.map((variantId, index) => ({
          product_id: variantId,
          image_url: urlData.publicUrl,
          alt_text: `${customName || product?.name || "Producto"} - ${selectedColorForUpload || "Color único"}`,
          sort_order: productImages.length + i + 1,
          is_primary: productImages.length === 0 && i === 0 && index === 0,
        }))

        console.log(`[v0] Inserting ${imageInserts.length} image records for all color variants`)

        const { data: insertResult, error: insertError } = await supabase
          .from("product_images")
          .insert(imageInserts)
          .select()

        if (insertError) {
          console.error("[v0] Database insert error:", insertError)
          await supabase.storage.from("product-images").remove([filePath])
          throw new Error(`Error al guardar imagen en base de datos: ${insertError.message}`)
        }

        console.log("[v0] Database insert successful:", insertResult)

        if (selectedColorForUpload && product?.zureo_code) {
          const { error: updateError } = await supabase
            .from("products_in_stock")
            .update({ image_url: urlData.publicUrl })
            .eq("zureo_code", product.zureo_code)
            .eq("color", selectedColorForUpload)

          if (updateError) {
            console.error("[v0] Error updating variant images:", updateError)
          } else {
            console.log(`[v0] Updated image_url for all ${selectedColorForUpload} variants`)
          }
        }

        successCount++
      }

      await loadProductImages()
      if (product?.zureo_code) {
        await loadVariants(product.zureo_code)
      }
      console.log("[v0] All images uploaded and saved successfully")

      toast({
        title: "✓ Imágenes cargadas exitosamente",
        description: `${successCount} imagen${successCount > 1 ? "es" : ""} ${successCount > 1 ? "fueron" : "fue"} ${successCount > 1 ? "cargadas" : "cargada"} para el color: ${selectedColorForUpload || "predeterminado"}`,
        className: "bg-green-50 border-green-200",
      })

      event.target.value = ""
    } catch (error) {
      console.error("[v0] Complete image upload error:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al subir imagen"
      setError(errorMessage)

      toast({
        title: "Error al cargar imágenes",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const removeImage = async (imageId: number) => {
    try {
      const imageToDelete = productImages.find((img) => img.id === imageId)
      if (!imageToDelete) {
        throw new Error("Imagen no encontrada")
      }

      console.log("[v0] Removing image:", imageToDelete)

      const { error: dbError } = await supabase.from("product_images").delete().eq("id", imageId)

      if (dbError) {
        console.error("[v0] Database delete error:", dbError)
        throw new Error(`Error al eliminar imagen de la base de datos: ${dbError.message}`)
      }

      if (imageToDelete.image_url) {
        try {
          const urlParts = imageToDelete.image_url.split("/")
          const fileName = urlParts[urlParts.length - 1]
          const filePath = `products/${fileName}`

          console.log("[v0] Removing from storage:", filePath)

          const { error: storageError } = await supabase.storage.from("product-images").remove([filePath])

          if (storageError) {
            console.warn("[v0] Storage delete warning:", storageError)
            // Don't throw error for storage deletion failures
          }
        } catch (storageError) {
          console.warn("[v0] Storage cleanup failed:", storageError)
          // Continue even if storage cleanup fails
        }
      }

      await loadProductImages()

      toast({
        title: "✓ Imagen eliminada",
        description: "La imagen ha sido eliminada correctamente",
        className: "bg-green-50 border-green-200",
      })

      console.log("[v0] Image removed successfully")
    } catch (error) {
      console.error("[v0] Remove image error:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar imagen"
      setError(errorMessage)

      toast({
        title: "Error al eliminar imagen",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const reorderImages = async (newOrder: ProductImage[]) => {
    try {
      console.log("[v0] Reordering images:", newOrder)

      // Update sort_order for all images
      const updates = newOrder.map((image, index) => ({
        id: image.id,
        sort_order: index,
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from("product_images")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id)

        if (error) {
          console.error("[v0] Error updating sort_order:", error)
          throw new Error(`Error al reordenar imágenes: ${error.message}`)
        }
      }

      await loadProductImages()

      toast({
        title: "✓ Orden actualizado",
        description: "El orden de las imágenes ha sido actualizado correctamente",
        className: "bg-green-50 border-green-200",
      })

      console.log("[v0] Images reordered successfully")
    } catch (error) {
      console.error("[v0] Reorder images error:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al reordenar imágenes"
      setError(errorMessage)

      toast({
        title: "Error al reordenar imágenes",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleDragStart = (imageId: number) => {
    setDraggedImageId(imageId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetImageId: number) => {
    if (!draggedImageId || draggedImageId === targetImageId) {
      setDraggedImageId(null)
      return
    }

    const draggedIndex = productImages.findIndex((img) => img.id === draggedImageId)
    const targetIndex = productImages.findIndex((img) => img.id === targetImageId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedImageId(null)
      return
    }

    const newOrder = [...productImages]
    const [draggedImage] = newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, draggedImage)

    reorderImages(newOrder)
    setDraggedImageId(null)
  }

  const saveChanges = async () => {
    if (!product) return

    try {
      setSaving(true)
      setError(null)

      const brandToSave = selectedBrand.toUpperCase()

      const requestData = {
        custom_name: customName,
        local_description: customDescription,
        local_price: customPrice ? Math.round(Number(customPrice)) : Math.round(product.price),
        local_images: productImages.map((img) => img.image_url),
        is_featured: isFeatured,
        brand: brandToSave, // Save brand in uppercase
        category: selectedCategory,
        subcategory: selectedSubcategory,
        gender: selectedGender,
        sale_price: isOnSale && salePrice ? Number.parseFloat(salePrice) : null,
        discount_percentage: isOnSale && discountPercentage ? Number.parseInt(discountPercentage) : null,
      }

      console.log("[v0] Sending request data:", requestData)

      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error("[v0] Response error:", errorData)
        throw new Error(`Error al guardar cambios: ${response.status}`)
      }

      const responseData = await response.json()
      console.log("[v0] Response data:", responseData)

      await Promise.all([loadProduct(), loadProductImages()])
      setError(null)

      toast({
        title: "✓ Cambios guardados exitosamente",
        description: "Los cambios en el producto han sido guardados correctamente",
        className: "bg-green-50 border-green-200",
      })
    } catch (error) {
      console.error("[v0] Save error:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")

      toast({
        title: "Error al guardar cambios",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const groupVariantsByColor = () => {
    const grouped = variants.reduce(
      (acc, variant) => {
        const color = variant.color || "Sin color"
        if (!acc[color]) {
          acc[color] = []
        }

        // Buscar si ya existe una variante con el mismo talle
        const existingVariant = acc[color].find((v) => v.size === variant.size)

        if (existingVariant) {
          // Si existe, sumar el stock
          existingVariant.stock_quantity += variant.stock_quantity
        } else {
          // Si no existe, agregar la variante
          acc[color].push({ ...variant })
        }

        return acc
      },
      {} as Record<string, ProductVariant[]>,
    )

    return grouped
  }

  useEffect(() => {
    if (isOnSale && discountPercentage && customPrice) {
      const basePrice = Number.parseFloat(customPrice)
      const discount = Number.parseInt(discountPercentage)
      if (!isNaN(basePrice) && !isNaN(discount) && discount > 0 && discount <= 100) {
        const calculatedSalePrice = basePrice * (1 - discount / 100)
        setSalePrice(calculatedSalePrice.toFixed(2))
      }
    }
  }, [discountPercentage, customPrice, isOnSale])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/admin/productos")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Producto</h1>
            <p className="text-muted-foreground">Personaliza nombre, descripción, precio e imagen</p>
          </div>
        </div>
        <Button onClick={saveChanges} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información de Zureo (Solo lectura) */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Zureo</CardTitle>
            <CardDescription>Datos sincronizados desde el sistema Zureo (solo lectura)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Código</Label>
              <p className="font-mono">{product?.zureo_code}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Nombre Original</Label>
              <p>{product?.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Precio Zureo</Label>
                <p className="text-lg font-semibold">${product?.precio_zureo || product?.price}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Categoría Zureo</Label>
                <p className="text-sm">{product?.categoria_zureo || product?.category}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Stock</Label>
              <Badge variant={totalStock > 5 ? "default" : totalStock > 0 ? "secondary" : "destructive"}>
                {totalStock} unidades
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Configuración Local */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración Personalizada</CardTitle>
            <CardDescription>Personaliza la presentación en tu tienda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="custom-name">Nombre personalizado</Label>
              <Input
                id="custom-name"
                placeholder="Nombre para mostrar en la tienda"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="custom-description">Descripción personalizada</Label>
              <Textarea
                id="custom-description"
                placeholder="Descripción adicional para tu tienda"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="custom-price">Precio personalizado</Label>
              <Input
                id="custom-price"
                type="number"
                placeholder={`Precio desde Zureo: $${customPrice || product?.price || 0}`}
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Precio de Zureo multiplicado por 1.22 (editable)</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="gender">Género</Label>
                <Select value={selectedGender} onValueChange={setSelectedGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="SELECCIONAR GÉNERO" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Categoría Principal</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value)
                    setSelectedSubcategory("")
                    setSelectedSubSubcategory("")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="SELECCIONAR CATEGORÍA" />
                  </SelectTrigger>
                  <SelectContent>
                    {getMainCategories().map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && (
                <div>
                  <Label htmlFor="subcategory">Subcategoría</Label>
                  <Select
                    value={selectedSubcategory}
                    onValueChange={(value) => {
                      console.log(`[v0] Selected subcategory: ${value}`)
                      setSelectedSubcategory(value)
                      setSelectedSubSubcategory("")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="SELECCIONAR SUBCATEGORÍA" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSubcategories(selectedCategory).map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.slug}>
                          {subcategory.name.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getSubcategories(selectedCategory).length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      No hay subcategorías disponibles para esta categoría
                      {selectedGender ? ` y género (${selectedGender})` : ""}
                    </p>
                  )}
                </div>
              )}

              {selectedSubcategory && getSubSubcategories(selectedSubcategory).length > 0 && (
                <div>
                  <Label htmlFor="sub-subcategory">Tipo Específico</Label>
                  <Select value={selectedSubSubcategory} onValueChange={setSelectedSubSubcategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="SELECCIONAR TIPO ESPECÍFICO" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSubSubcategories(selectedSubcategory).map((subSubcategory) => (
                        <SelectItem key={subSubcategory.id} value={subSubcategory.slug}>
                          {subSubcategory.name.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="brand">Marca</Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="SELECCIONAR MARCA" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.name}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
              <Label htmlFor="featured">Producto destacado</Label>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Switch id="on-sale" checked={isOnSale} onCheckedChange={setIsOnSale} />
                <Label htmlFor="on-sale">Producto en oferta</Label>
              </div>

              {isOnSale && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount-percentage">% Descuento</Label>
                    <Input
                      id="discount-percentage"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Porcentaje de descuento"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      El precio de oferta se calculará automáticamente
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="sale-price">Precio de oferta (calculado)</Label>
                    <Input
                      id="sale-price"
                      type="number"
                      step="0.01"
                      placeholder="Precio con descuento"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground mt-1">Calculado automáticamente desde el descuento</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Variantes del Producto</CardTitle>
          <CardDescription>Colores y talles disponibles con su stock</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingVariants ? (
            <p className="text-muted-foreground">Cargando variantes...</p>
          ) : variants.length === 0 ? (
            <p className="text-muted-foreground">No hay variantes disponibles</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupVariantsByColor()).map(([color, colorVariants]) => (
                <div key={color} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: color.toLowerCase() === "sin color" ? "#ccc" : color.toLowerCase() }}
                    />
                    <h3 className="font-semibold text-lg capitalize">{color}</h3>
                    <Badge variant="secondary">
                      {colorVariants.reduce((sum, v) => sum + v.stock_quantity, 0)} unidades
                    </Badge>
                    {colorVariants[0]?.image_url && (
                      <div className="relative w-12 h-12 ml-auto">
                        <Image
                          src={colorVariants[0].image_url || "/placeholder.svg"}
                          alt={`Imagen ${color}`}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {colorVariants.map((variant) => (
                      <div key={variant.id} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded">
                        <span className="font-medium">{variant.size || "Talle único"}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">${variant.price}</span>
                          <span className="font-semibold">{variant.stock_quantity} unidades</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Imágenes del Producto */}
      <Card>
        <CardHeader>
          <CardTitle>Imágenes del Producto</CardTitle>
          <CardDescription>
            {availableColors.length > 0
              ? "Selecciona un color y sube imágenes específicas para ese color. Las imágenes se aplicarán a todas las variantes del color seleccionado."
              : "Gestiona múltiples imágenes para mostrar en tu tienda. Arrastra para reordenar, haz clic en la estrella para marcar como principal, o en la X para eliminar."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {availableColors.length > 0 && (
              <div>
                <Label htmlFor="color-select">Selecciona el color para las imágenes</Label>
                <Select value={selectedColorForUpload} onValueChange={setSelectedColorForUpload}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar color" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColors.map((color) => (
                      <SelectItem key={color} value={color}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: color.toLowerCase() }}
                          />
                          <span className="capitalize">{color}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Las imágenes que subas se asociarán con el color:{" "}
                  <span className="font-semibold capitalize">{selectedColorForUpload}</span>
                </p>
              </div>
            )}

            {productImages.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-3 block">Imágenes actuales</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {productImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative group cursor-move"
                      draggable
                      onDragStart={() => handleDragStart(image.id)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(image.id)}
                    >
                      <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white rounded p-1 shadow-md">
                          <GripVertical className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>

                      <div className="relative w-full h-32 border-2 rounded-lg overflow-hidden transition-all hover:border-primary">
                        <Image
                          src={image.image_url || "/placeholder.svg"}
                          alt={image.alt_text}
                          fill
                          className="object-cover"
                        />
                        {image.is_primary && (
                          <Badge className="absolute bottom-2 left-2 text-xs bg-yellow-500 hover:bg-yellow-600 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            Principal
                          </Badge>
                        )}
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!image.is_primary && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setPrimaryImage(image.id)}
                            className="h-8 px-2 text-xs bg-white hover:bg-gray-100 shadow-md"
                            title="Marcar como imagen principal"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Principal
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImage(image.id)}
                          className="h-8 w-8 p-0 shadow-md"
                          title="Eliminar imagen"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {uploading
                      ? "Subiendo imagen..."
                      : availableColors.length > 0
                        ? `Haz clic para agregar imágenes para el color: ${selectedColorForUpload}`
                        : "Haz clic para agregar nueva imagen"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Puedes seleccionar múltiples archivos a la vez</p>
                </div>
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading || (availableColors.length > 0 && !selectedColorForUpload)}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
