"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Edit, RefreshCw, Percent } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Popup } from "@/components/ui/popup"

interface DiscountRule {
  id: number
  name: string
  type: "brand" | "category" | "subcategory" | "combined"
  target_id: number
  target_name: string
  discount_percentage: number
  start_date?: string
  end_date?: string
  is_active: boolean
  created_at: string
  brand_id?: number
  category_id?: number
  subcategory_id?: number
}

interface Brand {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
}

interface Subcategory {
  id: number
  name: string
  category_id: number
}

export default function DescuentosPage() {
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRule, setEditingRule] = useState<DiscountRule | null>(null)

  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState("")

  const [filterType, setFilterType] = useState<"simple" | "combined">("simple")
  const [formData, setFormData] = useState({
    name: "",
    type: "brand" as "brand" | "category" | "subcategory",
    target_id: "",
    target_name: "",
    discount_percentage: "",
    start_date: "",
    end_date: "",
    is_active: true,
    // Filtros combinados
    brand_id: "",
    category_id: "",
    subcategory_id: "",
  })

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Cargar reglas de descuento
      const { data: rules, error: rulesError } = await supabase
        .from("discount_rules")
        .select("*")
        .order("created_at", { ascending: false })

      if (rulesError) throw rulesError

      // Cargar marcas
      const { data: brandsData, error: brandsError } = await supabase.from("brands").select("id, name").order("name")

      if (brandsError) throw brandsError

      // Cargar categorías
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name")
        .eq("level", 1)
        .order("name")

      if (categoriesError) throw categoriesError

      // Cargar subcategorías
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from("subcategories")
        .select("id, name, category_id")
        .order("name")

      if (subcategoriesError) throw subcategoriesError

      setDiscountRules(rules || [])
      setBrands(brandsData || [])
      setCategories(categoriesData || [])
      setSubcategories(subcategoriesData || [])
    } catch (error) {
      console.error("Error loading data:", error)
      setPopupMessage("Error al cargar los datos")
      setShowErrorPopup(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (filterType === "combined") {
        if (
          (!formData.brand_id || formData.brand_id === "all") &&
          (!formData.category_id || formData.category_id === "all") &&
          (!formData.subcategory_id || formData.subcategory_id === "all")
        ) {
          setPopupMessage("Debes seleccionar al menos un filtro (marca, categoría o subcategoría)")
          setShowErrorPopup(true)
          return
        }
      } else {
        if (!formData.target_id) {
          setPopupMessage("Debes seleccionar un objetivo para el descuento")
          setShowErrorPopup(true)
          return
        }
      }

      const ruleData = {
        name: formData.name,
        type: filterType === "combined" ? "combined" : formData.type,
        target_id: filterType === "simple" ? Number.parseInt(formData.target_id) : 0,
        target_name: filterType === "simple" ? formData.target_name : "Filtros combinados",
        discount_percentage: Number.parseInt(formData.discount_percentage),
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_active: formData.is_active,
        brand_id: formData.brand_id && formData.brand_id !== "all" ? Number.parseInt(formData.brand_id) : null,
        category_id:
          formData.category_id && formData.category_id !== "all" ? Number.parseInt(formData.category_id) : null,
        subcategory_id:
          formData.subcategory_id && formData.subcategory_id !== "all"
            ? Number.parseInt(formData.subcategory_id)
            : null,
      }

      if (editingRule) {
        await supabase.from("discount_rules").update(ruleData).eq("id", editingRule.id)
        setPopupMessage("Regla de descuento actualizada exitosamente")
      } else {
        await supabase.from("discount_rules").insert([ruleData])
        setPopupMessage("Regla de descuento creada exitosamente")
      }

      setShowSuccessPopup(true)
      resetForm()
      loadData()
    } catch (error) {
      console.error("Error saving discount rule:", error)
      setPopupMessage("Error al guardar la regla de descuento")
      setShowErrorPopup(true)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta regla de descuento?")) {
      try {
        await supabase.from("discount_rules").delete().eq("id", id)
        setPopupMessage("Regla de descuento eliminada exitosamente")
        setShowSuccessPopup(true)
        loadData()
      } catch (error) {
        console.error("Error deleting discount rule:", error)
        setPopupMessage("Error al eliminar la regla de descuento")
        setShowErrorPopup(true)
      }
    }
  }

  const handleEdit = (rule: DiscountRule) => {
    setEditingRule(rule)

    const isCombined = rule.brand_id || rule.category_id || rule.subcategory_id
    setFilterType(isCombined ? "combined" : "simple")

    setFormData({
      name: rule.name,
      type: rule.type === "combined" ? "brand" : rule.type,
      target_id: rule.target_id.toString(),
      target_name: rule.target_name,
      discount_percentage: rule.discount_percentage.toString(),
      start_date: rule.start_date ? rule.start_date.split("T")[0] : "",
      end_date: rule.end_date ? rule.end_date.split("T")[0] : "",
      is_active: rule.is_active,
      brand_id: rule.brand_id?.toString() || "",
      category_id: rule.category_id?.toString() || "",
      subcategory_id: rule.subcategory_id?.toString() || "",
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "brand",
      target_id: "",
      target_name: "",
      discount_percentage: "",
      start_date: "",
      end_date: "",
      is_active: true,
      brand_id: "",
      category_id: "",
      subcategory_id: "",
    })
    setFilterType("simple")
    setEditingRule(null)
    setShowForm(false)
  }

  const handleTargetChange = (targetId: string) => {
    let targetName = ""

    if (formData.type === "brand") {
      const brand = brands.find((b) => b.id.toString() === targetId)
      targetName = brand?.name || ""
    } else if (formData.type === "category") {
      const category = categories.find((c) => c.id.toString() === targetId)
      targetName = category?.name || ""
    } else if (formData.type === "subcategory") {
      const subcategory = subcategories.find((s) => s.id.toString() === targetId)
      targetName = subcategory?.name || ""
    }

    setFormData((prev) => ({
      ...prev,
      target_id: targetId,
      target_name: targetName,
    }))
  }

  const getCombinedFilterNames = (rule: DiscountRule) => {
    const filters = []
    if (rule.brand_id) {
      const brand = brands.find((b) => b.id === rule.brand_id)
      if (brand) filters.push(`Marca: ${brand.name}`)
    }
    if (rule.category_id) {
      const category = categories.find((c) => c.id === rule.category_id)
      if (category) filters.push(`Categoría: ${category.name}`)
    }
    if (rule.subcategory_id) {
      const subcategory = subcategories.find((s) => s.id === rule.subcategory_id)
      if (subcategory) filters.push(`Subcategoría: ${subcategory.name}`)
    }
    return filters.join(" + ")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary" />
          <div>
            <p className="text-xl font-semibold">Cargando descuentos...</p>
            <p className="text-muted-foreground">Obteniendo marcas, categorías y reglas</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Percent className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Gestión de Descuentos</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Crea y administra reglas de descuento para marcas, categorías y subcategorías
        </p>
        <Button onClick={() => setShowForm(true)} size="lg" className="mt-4">
          <Plus className="w-5 h-5 mr-2" />
          Nueva Regla de Descuento
        </Button>
      </div>

      {showForm && (
        <Card className="border-2">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-2xl">
              {editingRule ? "Editar Regla de Descuento" : "Nueva Regla de Descuento"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer transition-all ${filterType === "simple" ? "border-primary border-2 bg-primary/5" : "hover:border-primary/50"}`}
                  onClick={() => setFilterType("simple")}
                >
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold mb-1">Filtro Simple</h3>
                    <p className="text-sm text-muted-foreground">Aplicar a una marca, categoría o subcategoría</p>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-all ${filterType === "combined" ? "border-primary border-2 bg-primary/5" : "hover:border-primary/50"}`}
                  onClick={() => setFilterType("combined")}
                >
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold mb-1">Filtros Combinados</h3>
                    <p className="text-sm text-muted-foreground">Combinar marca + categoría + subcategoría</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre de la Regla *</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Descuento Verano 2025"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Porcentaje de Descuento (%) *</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="Ej: 20"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discount_percentage: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {filterType === "simple" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Tipo *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) =>
                        setFormData((prev) => ({ ...prev, type: value, target_id: "", target_name: "" }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brand">Marca</SelectItem>
                        <SelectItem value="category">Categoría</SelectItem>
                        <SelectItem value="subcategory">Subcategoría</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="target">
                      {formData.type === "brand"
                        ? "Marca *"
                        : formData.type === "category"
                          ? "Categoría *"
                          : "Subcategoría *"}
                    </Label>
                    <Select value={formData.target_id} onValueChange={handleTargetChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.type === "brand" &&
                          brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id.toString()}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        {formData.type === "category" &&
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        {formData.type === "subcategory" &&
                          subcategories.map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                              {subcategory.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 border-2 border-dashed border-primary/30 rounded-lg p-4 bg-primary/5">
                  <p className="text-sm font-medium text-center mb-4">Selecciona uno o más filtros para combinar</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="brand-filter">Marca (opcional)</Label>
                      <Select
                        value={formData.brand_id}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, brand_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las marcas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las marcas</SelectItem>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id.toString()}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category-filter">Categoría (opcional)</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las categorías</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="subcategory-filter">Subcategoría (opcional)</Label>
                      <Select
                        value={formData.subcategory_id}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, subcategory_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las subcategorías" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las subcategorías</SelectItem>
                          {subcategories.map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                              {subcategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Fecha de Inicio (Opcional)</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Fecha de Fin (Opcional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Regla Activa
                </Label>
              </div>

              <div className="flex justify-center space-x-3 pt-4">
                <Button type="submit" size="lg">
                  {editingRule ? "Actualizar" : "Crear"} Regla
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-center mb-6">Reglas de Descuento Activas</h2>
        {discountRules.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Percent className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg text-muted-foreground">No hay reglas de descuento configuradas</p>
              <p className="text-sm text-muted-foreground mt-2">Crea tu primera regla para comenzar</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {discountRules.map((rule) => (
              <Card key={rule.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-lg">{rule.name}</h3>
                        <Badge variant={rule.is_active ? "default" : "secondary"} className="text-sm">
                          {rule.is_active ? "Activa" : "Inactiva"}
                        </Badge>
                        <Badge variant="outline" className="text-sm bg-primary/10">
                          {rule.discount_percentage}% OFF
                        </Badge>
                        {rule.type === "combined" ? (
                          <Badge variant="outline" className="text-sm bg-purple-100 text-purple-700 border-purple-300">
                            Filtros Combinados
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-sm">
                            {rule.type === "brand" ? "Marca" : rule.type === "category" ? "Categoría" : "Subcategoría"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rule.type === "combined" ? (
                          <span className="font-medium">{getCombinedFilterNames(rule)}</span>
                        ) : (
                          <span>
                            <strong>{rule.target_name}</strong> - {rule.discount_percentage}% de descuento
                          </span>
                        )}
                      </p>
                      {(rule.start_date || rule.end_date) && (
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="font-medium">Vigencia:</span>
                          {rule.start_date && `Desde ${new Date(rule.start_date).toLocaleDateString()}`}
                          {rule.start_date && rule.end_date && " • "}
                          {rule.end_date && `Hasta ${new Date(rule.end_date).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(rule)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(rule.id)}
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Popup
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title="¡Éxito!"
        message={popupMessage}
        type="success"
      />

      <Popup
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title="Error"
        message={popupMessage}
        type="error"
      />
    </div>
  )
}
