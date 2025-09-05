"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Edit, RefreshCw } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface DiscountRule {
  id: number
  name: string
  type: "brand" | "category" | "subcategory"
  target_id: number
  target_name: string
  discount_percentage: number
  start_date?: string
  end_date?: string
  is_active: boolean
  created_at: string
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

  const [formData, setFormData] = useState({
    name: "",
    type: "brand" as "brand" | "category" | "subcategory",
    target_id: "",
    target_name: "",
    discount_percentage: "",
    start_date: "",
    end_date: "",
    is_active: true,
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      console.log("[v0] Descuentos - Cargando datos...")

      // Cargar reglas de descuento
      const { data: rules, error: rulesError } = await supabase
        .from("discount_rules")
        .select("*")
        .order("created_at", { ascending: false })

      if (rulesError) {
        console.error("[v0] Error loading discount rules:", rulesError)
      }

      // Cargar marcas
      const { data: brandsData, error: brandsError } = await supabase.from("brands").select("id, name").order("name")

      if (brandsError) {
        console.error("[v0] Error loading brands:", brandsError)
      }

      // Cargar categorías
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name")
        .order("name")

      if (categoriesError) {
        console.error("[v0] Error loading categories:", categoriesError)
      }

      // Cargar subcategorías
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from("subcategories")
        .select("id, name, category_id")
        .order("name")

      if (subcategoriesError) {
        console.error("[v0] Error loading subcategories:", subcategoriesError)
      }

      console.log("[v0] Descuentos - Datos cargados:", {
        rules: rules?.length || 0,
        brands: brandsData?.length || 0,
        categories: categoriesData?.length || 0,
        subcategories: subcategoriesData?.length || 0,
      })

      setDiscountRules(rules || [])
      setBrands(brandsData || [])
      setCategories(categoriesData || [])
      setSubcategories(subcategoriesData || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const ruleData = {
        name: formData.name,
        type: formData.type,
        target_id: Number.parseInt(formData.target_id),
        target_name: formData.target_name,
        discount_percentage: Number.parseInt(formData.discount_percentage),
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_active: formData.is_active,
      }

      if (editingRule) {
        await supabase.from("discount_rules").update(ruleData).eq("id", editingRule.id)
      } else {
        await supabase.from("discount_rules").insert([ruleData])
      }

      resetForm()
      loadData()
    } catch (error) {
      console.error("Error saving discount rule:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta regla de descuento?")) {
      try {
        await supabase.from("discount_rules").delete().eq("id", id)

        loadData()
      } catch (error) {
        console.error("Error deleting discount rule:", error)
      }
    }
  }

  const handleEdit = (rule: DiscountRule) => {
    setEditingRule(rule)
    setFormData({
      name: rule.name,
      type: rule.type,
      target_id: rule.target_id.toString(),
      target_name: rule.target_name,
      discount_percentage: rule.discount_percentage.toString(),
      start_date: rule.start_date ? rule.start_date.split("T")[0] : "",
      end_date: rule.end_date ? rule.end_date.split("T")[0] : "",
      is_active: rule.is_active,
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
    })
    setEditingRule(null)
    setShowForm(false)
  }

  const handleTypeChange = (type: "brand" | "category" | "subcategory") => {
    setFormData((prev) => ({
      ...prev,
      type,
      target_id: "",
      target_name: "",
    }))
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">Cargando descuentos...</p>
            <p className="text-muted-foreground">Obteniendo marcas, categorías y reglas de descuento</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Descuentos</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Regla de Descuento
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRule ? "Editar Regla de Descuento" : "Nueva Regla de Descuento"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre de la Regla</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={handleTypeChange}>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target">
                    {formData.type === "brand" ? "Marca" : formData.type === "category" ? "Categoría" : "Subcategoría"}
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
                <div>
                  <Label htmlFor="discount">Porcentaje de Descuento (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discount_percentage: e.target.value }))}
                    required
                  />
                </div>
              </div>

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
                />
                <Label htmlFor="is_active">Regla Activa</Label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit">{editingRule ? "Actualizar" : "Crear"} Regla</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">Reglas de Descuento Activas</h2>
        {discountRules.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">No hay reglas de descuento configuradas</CardContent>
          </Card>
        ) : (
          discountRules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{rule.name}</h3>
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                      <Badge variant="outline">
                        {rule.type === "brand" ? "Marca" : rule.type === "category" ? "Categoría" : "Subcategoría"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      <strong>{rule.target_name}</strong> - {rule.discount_percentage}% de descuento
                    </p>
                    {(rule.start_date || rule.end_date) && (
                      <p className="text-xs text-gray-500">
                        {rule.start_date && `Desde: ${new Date(rule.start_date).toLocaleDateString()}`}
                        {rule.start_date && rule.end_date && " | "}
                        {rule.end_date && `Hasta: ${new Date(rule.end_date).toLocaleDateString()}`}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(rule)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(rule.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
