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
import { loadBrands } from "@/utils/loadBrands" // Import loadBrands function

interface Product {
  id: number
  zureo_id: number
  zureo_code: string
  name: string
  description: string
  price: number
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
}

interface Brand {
  id: number
  name: string
  slug: string
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
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customName, setCustomName] = useState("")
  const [customDescription, setCustomDescription] = useState("")
  const [customPrice, setCustomPrice] = useState("")
  const [customImage, setCustomImage] = useState("")
  const [salePrice, setSalePrice] = useState("")
  const [discountPercentage, setDiscountPercentage] = useState("")
  const [isOnSale, setIsOnSale] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState("")
  const [selectedGender, setSelectedGender] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSubcategory, setSelectedSubcategory] = useState("")
  const [isFeatured, setIsFeatured] = useState(false)
  const [uploading, setUploading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const genderOptions = [
    { value: "hombre", label: "Hombre" },
    { value: "mujer", label: "Mujer" },
  ]

  const categoryOptions = [
    { value: "marca", label: "Marca" },
    { value: "vestimenta", label: "Vestimenta" },
    { value: "accesorios", label: "Accesorios" },
  ]

  const subcategoryOptions = {
    vestimenta: [
      { value: "camisetas", label: "Camisetas" },
      { value: "pantalones", label: "Pantalones" },
      { value: "jeans", label: "Jeans" },
      { value: "buzos", label: "Buzos" },
      { value: "canguros", label: "Canguros" },
      { value: "remeras", label: "Remeras" },
      { value: "vestidos", label: "Vestidos" },
      { value: "camisas", label: "Camisas" },
    ],
    accesorios: [
      { value: "zapatillas", label: "Zapatillas" },
      { value: "zapatos", label: "Zapatos" },
      { value: "bolsos", label: "Bolsos" },
      { value: "cinturones", label: "Cinturones" },
      { value: "gorros", label: "Gorros" },
    ],
  }

  useEffect(() => {
    loadProduct()
    loadBrandsData()
    loadProductImages()
  }, [params.id])

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
      const response = await fetch(`/api/admin/products/${params.id}`)

      if (!response.ok) {
        throw new Error("Producto no encontrado")
      }

      const data = await response.json()
      const prod = data.product

      setProduct(prod)
      setCustomName(prod.name || "")
      setCustomDescription(prod.description || "")
      setCustomPrice(prod.price?.toString() || "")
      setCustomImage(prod.image_url || "")
      setSalePrice(prod.sale_price?.toString() || "")
      setDiscountPercentage(prod.discount_percentage?.toString() || "")
      setIsOnSale(!!prod.sale_price || !!prod.discount_percentage)
      setSelectedBrand(prod.brand || "")
      const categoryParts = (prod.category || "").split("-")
      setSelectedGender(categoryParts[0] || "")
      setSelectedCategory(categoryParts[1] || "")
      setSelectedSubcategory(categoryParts[2] || "")
      setIsFeatured(prod.is_featured || false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const loadBrandsData = async () => {
    try {
      const brandsData = await loadBrands()
      setBrands(brandsData)
    } catch (error) {
      console.error("Error cargando marcas:", error)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage.from("banners").upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("banners").getPublicUrl(filePath)

      // Add to product_images table
      const { error: insertError } = await supabase.from("product_images").insert({
        product_id: Number.parseInt(params.id),
        image_url: data.publicUrl,
        alt_text: customName || product?.name || "Imagen del producto",
        sort_order: productImages.length,
        is_primary: productImages.length === 0, // First image is primary
      })

      if (insertError) throw insertError

      // Reload images
      await loadProductImages()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al subir imagen")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = async (imageId: number) => {
    try {
      const { error } = await supabase.from("product_images").delete().eq("id", imageId)

      if (error) throw error

      await loadProductImages()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al eliminar imagen")
    }
  }

  const setPrimaryImage = async (imageId: number) => {
    try {
      // First, set all images as non-primary
      await supabase.from("product_images").update({ is_primary: false }).eq("product_id", params.id)

      // Then set the selected image as primary
      const { error } = await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId)

      if (error) throw error

      await loadProductImages()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al establecer imagen principal")
    }
  }

  const saveChanges = async () => {
    if (!product) return

    try {
      setSaving(true)
      setError(null)

      const categoryString = [selectedGender, selectedCategory, selectedSubcategory].filter(Boolean).join("-")

      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          custom_name: customName,
          local_description: customDescription || null,
          local_price: customPrice ? Number.parseFloat(customPrice) : null,
          local_images: customImage ? [customImage] : [],
          is_featured: isFeatured,
          brand: selectedBrand,
          category: categoryString,
          sale_price: isOnSale && salePrice ? Number.parseFloat(salePrice) : null,
          discount_percentage: isOnSale && discountPercentage ? Number.parseInt(discountPercentage) : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al guardar cambios")
      }

      router.push("/admin/productos")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setSaving(false)
    }
  }

  const zureoData = product?.zureo_data
    ? typeof product.zureo_data === "string"
      ? JSON.parse(product.zureo_data)
      : product.zureo_data
    : null
  const originalProduct = zureoData?.originalProduct

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Producto no encontrado</h2>
        <p className="text-muted-foreground mb-4">El producto que buscas no existe o no está disponible.</p>
        <Button onClick={() => router.push("/admin/productos")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a productos
        </Button>
      </div>
    )
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
              <p className="font-mono">{product.zureo_code}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Nombre Original</Label>
              <p>{originalProduct?.nombre || product.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Precio Zureo</Label>
                <p className="text-lg font-semibold">${originalProduct?.precio || product.price}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Stock</Label>
                <Badge
                  variant={
                    product.stock_quantity > 5 ? "default" : product.stock_quantity > 0 ? "secondary" : "destructive"
                  }
                >
                  {product.stock_quantity} unidades
                </Badge>
              </div>
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
                step="0.01"
                placeholder={`Precio actual: $${product.price}`}
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
              />
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
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value)
                    setSelectedSubcategory("") // Reset subcategory when category changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory &&
                selectedCategory !== "marca" &&
                subcategoryOptions[selectedCategory as keyof typeof subcategoryOptions] && (
                  <div>
                    <Label htmlFor="subcategory">Subcategoría</Label>
                    <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar subcategoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategoryOptions[selectedCategory as keyof typeof subcategoryOptions].map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
            {/* Current Images */}
            {productImages.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-3 block">Imágenes actuales</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {productImages.map((image, index) => (
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

            {/* Upload New Image */}
            <div>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {uploading ? "Subiendo imagen..." : "Haz clic para agregar nueva imagen"}
                  </p>
                </div>
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
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
