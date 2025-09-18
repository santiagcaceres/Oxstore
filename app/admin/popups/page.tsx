"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface Popup {
  id: number
  title: string
  content: string
  image_url: string
  link_url: string
  is_active: boolean
  show_delay: number
}

export default function PopupsAdminPage() {
  const [popup, setPopup] = useState<Popup | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
    link_url: "",
    is_active: true,
    show_delay: 5000,
  })

  const loadPopup = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("popups").select("*").limit(1).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading popup:", error)
        return
      }

      if (data) {
        setPopup(data)
        setFormData({
          title: data.title || "",
          content: data.content || "",
          image_url: data.image_url || "",
          link_url: data.link_url || "",
          is_active: data.is_active || false,
          show_delay: data.show_delay || 5000,
        })
      }
    } catch (error) {
      console.error("Error loading popup:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()

      if (popup) {
        // Update existing popup
        const { error } = await supabase
          .from("popups")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", popup.id)

        if (error) throw error
        toast({ title: "Popup actualizado correctamente" })
      } else {
        // Create new popup
        const { data, error } = await supabase.from("popups").insert([formData]).select().single()

        if (error) throw error
        setPopup(data)
        toast({ title: "Popup creado correctamente" })
      }

      await loadPopup()
    } catch (error) {
      console.error("Error saving popup:", error)
      toast({
        title: "Error al guardar popup",
        description: "Inténtalo de nuevo",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!popup) return

    if (!confirm("¿Estás seguro de que quieres eliminar el popup?")) return

    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("popups").delete().eq("id", popup.id)

      if (error) throw error

      setPopup(null)
      setFormData({
        title: "",
        content: "",
        image_url: "",
        link_url: "",
        is_active: true,
        show_delay: 5000,
      })

      toast({ title: "Popup eliminado correctamente" })
    } catch (error) {
      console.error("Error deleting popup:", error)
      toast({
        title: "Error al eliminar popup",
        description: "Inténtalo de nuevo",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const supabase = createClient()
      const fileExt = file.name.split(".").pop()
      const fileName = `popup-${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage.from("images").upload(fileName, file)

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(fileName)

      setFormData((prev) => ({ ...prev, image_url: publicUrl }))
      toast({ title: "Imagen subida correctamente" })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error al subir imagen",
        description: "Inténtalo de nuevo",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    loadPopup()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Popup</h1>
        <p className="text-muted-foreground">Configura el popup que aparece al cargar la página principal</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{popup ? "Editar Popup" : "Crear Popup"}</CardTitle>
          <CardDescription>
            {popup ? "Modifica la configuración del popup existente" : "Crea un nuevo popup para la página principal"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Título del popup"
                />
              </div>

              <div>
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Contenido del popup"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="link_url">URL de destino</Label>
                <Input
                  id="link_url"
                  value={formData.link_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, link_url: e.target.value }))}
                  placeholder="/ofertas"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="image">Imagen</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} className="mb-2" />
                {formData.image_url && (
                  <div className="mt-2">
                    <img
                      src={formData.image_url || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="show_delay">Delay (milisegundos)</Label>
                <Input
                  id="show_delay"
                  type="number"
                  value={formData.show_delay}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, show_delay: Number.parseInt(e.target.value) || 5000 }))
                  }
                  placeholder="5000"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Tiempo antes de mostrar el popup (5000 = 5 segundos)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Popup activo</Label>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : popup ? "Actualizar Popup" : "Crear Popup"}
            </Button>

            {popup && (
              <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                Eliminar Popup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {popup && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Vista Previa</CardTitle>
            <CardDescription>Así se verá el popup en la página principal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="bg-white rounded-lg max-w-md mx-auto p-6 relative shadow-lg">
                <div className="absolute top-4 right-4 text-gray-500">✕</div>
                <div className="text-center">
                  {formData.image_url && (
                    <img
                      src={formData.image_url || "/placeholder.svg"}
                      alt={formData.title}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-xl font-bold mb-2">{formData.title}</h3>
                  <p className="text-gray-600 mb-4">{formData.content}</p>
                  <div className="bg-black text-white text-center py-2 px-4 rounded">Ver más</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Estado: {formData.is_active ? "Activo" : "Inactivo"} | Delay: {formData.show_delay}ms
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
