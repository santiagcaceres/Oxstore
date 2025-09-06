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
import { Upload, X, Save, ArrowLeft, AlertCircle } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

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

interface ProductImage {
  id: number
  product_id: number
  image_url: string
  alt_text: string
  sort_order: number
  is_primary: boolean
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
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
  const getSubcategories = (parentSlug: string) => {
    const parent = categories.find((cat) => cat.slug === parentSlug && cat.level === 1)
    return parent ? categories.filter((cat) => cat.parent_id === parent.id && cat.level === 2) : []
  }
  const getSubSubcategories = (parentSlug: string) => {
    const parent = categories.find((cat) => cat.slug === parentSlug && cat.level === 2)
    return parent ? categories.filter((cat) => cat.parent_id === parent.id && cat.level === 3) : []
  }

  const setPrimaryImage = async (imageId: number) => {
    try {
      const { error: updateError } = await supabase
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", imageId)

      if (updateError) {
        console.error("[v0] Database update error:", updateError)
        throw new Error(`Error al marcar imagen como principal: ${updateError.message}`)
      }

      await loadProductImages()
      console.log("[v0] Image marked as primary successfully")
    } catch (error) {
      console.error("[v0] Set primary image error:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al marcar imagen como principal"
      setError(errorMessage)
    }
  }

  useEffect(() => {
    console.log("[v0] Edit product page loaded with params:", params)
    loadProduct()
    loadBrandsData()
    loadCategoriesData()
    loadProductImages()
  }, [params])

  const loadCategoriesData = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*").eq("is_active", true).order("sort_order")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error cargando categorías:", error)
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

          // Extract price from zureo_data and round it (no decimals)
          if (zureoData.precio || zureoData.price) {
            zureoPrice = Math.round(Number(zureoData.precio || zureoData.price))
            console.log("[v0] Extracted and rounded zureo price:", zureoPrice)
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

    try {
      setUploading(true)
      setError(null)

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        if (!file.type.startsWith("image/")) {
          throw new Error(`El archivo ${file.name} no es una imagen válida`)
        }

        const fileExt = file.name.split(".").pop()?.toLowerCase()
        const fileName = `product-${params.id}-${Date.now()}-${i}.${fileExt}`
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

        const productId = Number.parseInt(params.id, 10)
        if (isNaN(productId)) {
          throw new Error("ID de producto inválido")
        }

        // Verify product exists in products_in_stock before inserting image
        const { data: productExists, error: checkError } = await supabase
          .from("products_in_stock")
          .select("id")
          .eq("id", productId)
          .single()

        if (checkError || !productExists) {
          console.error("[v0] Product not found in products_in_stock:", checkError)
          throw new Error("El producto no existe en la base de datos")
        }

        const insertData = {
          product_id: productId,
          image_url: urlData.publicUrl,
          alt_text: customName || product?.name || "Imagen del producto",
          sort_order: productImages.length + i + 1,
          is_primary: productImages.length === 0 && i === 0,
        }

        console.log("[v0] Inserting image data:", insertData)

        const { data: insertResult, error: insertError } = await supabase
          .from("product_images")
          .insert(insertData)
          .select()

        if (insertError) {
          console.error("[v0] Database insert error:", insertError)
          // Clean up uploaded file if database insert fails
          await supabase.storage.from("product-images").remove([filePath])
          throw new Error(`Error al guardar imagen en base de datos: ${insertError.message}`)
        }

        console.log("[v0] Database insert successful:", insertResult)
      }

      await loadProductImages()
      console.log("[v0] All images uploaded and saved successfully")

      event.target.value = ""
    } catch (error) {
      console.error("[v0] Complete image upload error:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al subir imagen"
      setError(errorMessage)
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
      console.log("[v0] Image removed successfully")
    } catch (error) {
      console.error("[v0] Remove image error:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar imagen"
      setError(errorMessage)
    }
  }

  const saveChanges = async () => {
    if (!product) return

    try {
      setSaving(true)
      setError(null)

      const requestData = {
        custom_name: customName,
        local_description: customDescription,
        local_price: customPrice ? Math.round(Number(customPrice)) : Math.round(product.price),
        local_images: productImages.map((img) => img.image_url),
        is_featured: isFeatured,
        brand: selectedBrand,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        gender: selectedGender, // Added gender field that was missing
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

      // Show success message briefly before redirecting
      setTimeout(() => {
        router.push("/admin/productos")
      }, 1000)
    } catch (error) {
      console.error("[v0] Save error:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setSaving(false)
    }
  }

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
              <Badge
                variant={
                  (product?.stock_quantity || 0) > 5
                    ? "default"
                    : (product?.stock_quantity || 0) > 0
                      ? "secondary"
                      : "destructive"
                }
              >
                {product?.stock_quantity || 0} unidades
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
              <p className="text-xs text-muted-foreground mt-1">Precio extraído desde Zureo (sin decimales)</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="gender">Género</Label>
                <Select value={selectedGender} onValueChange={setSelectedGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar género" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {getMainCategories().map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && getSubcategories(selectedCategory).length > 0 && (
                <div>
                  <Label htmlFor="subcategory">Subcategoría</Label>
                  <Select
                    value={selectedSubcategory}
                    onValueChange={(value) => {
                      setSelectedSubcategory(value)
                      setSelectedSubSubcategory("")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar subcategoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSubcategories(selectedCategory).map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.slug}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedSubcategory && getSubSubcategories(selectedSubcategory).length > 0 && (
                <div>
                  <Label htmlFor="sub-subcategory">Tipo Específico</Label>
                  <Select value={selectedSubSubcategory} onValueChange={setSelectedSubSubcategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo específico" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSubSubcategories(selectedSubcategory).map((subSubcategory) => (
                        <SelectItem key={subSubcategory.id} value={subSubcategory.slug}>
                          {subSubcategory.name}
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
                  <SelectValue placeholder="Seleccionar marca" />
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
                    <Label htmlFor="sale-price">Precio de oferta</Label>
                    <Input
                      id="sale-price"
                      type="number"
                      step="0.01"
                      placeholder="Precio con descuento"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                    />
                  </div>
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
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Imágenes del Producto</CardTitle>
          <CardDescription>Gestiona múltiples imágenes para mostrar en tu tienda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {productImages.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-3 block">Imágenes actuales</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {productImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="relative w-full h-32">
                        <Image
                          src={image.image_url || "/placeholder.svg"}
                          alt={image.alt_text}
                          fill
                          className="object-cover rounded-lg"
                        />
                        {image.is_primary && <Badge className="absolute top-2 left-2 text-xs">Principal</Badge>}
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        {!image.is_primary && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setPrimaryImage(image.id)}
                            className="h-6 w-6 p-0"
                          >
                            <span className="text-xs">★</span>
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImage(image.id)}
                          className="h-6 w-6 p-0"
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
                    {uploading ? "Subiendo imagen..." : "Haz clic para agregar nueva imagen"}
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
                disabled={uploading}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
