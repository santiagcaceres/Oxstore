"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Search, Tag, Trash2 } from "lucide-react"

interface Product {
  id: number
  codigo: string
  nombre: string
  precio: number
  marca: {
    nombre: string
  }
  stock: number
}

export default function SaleManagementPage() {
  const [codes, setCodes] = useState("")
  const [discount, setDiscount] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const searchProducts = async () => {
    if (!codes.trim()) return

    setLoading(true)
    setMessage("")

    try {
      const codeList = codes
        .split(/[\n,;]/)
        .map((code) => code.trim())
        .filter((code) => code.length > 0)

      const response = await fetch("/api/products/search-by-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ codes: codeList }),
      })

      const data = await response.json()

      if (data.success) {
        setProducts(data.products)
        setMessage(`Se encontraron ${data.products.length} productos`)
      } else {
        setMessage("Error al buscar productos")
      }
    } catch (error) {
      setMessage("Error al buscar productos")
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const applySale = async () => {
    if (products.length === 0 || !discount) return

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/products/apply-sale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productCodes: products.map((p) => p.codigo),
          discountPercentage: Number.parseFloat(discount),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`Oferta aplicada a ${products.length} productos`)
        setProducts([])
        setCodes("")
        setDiscount("")
      } else {
        setMessage("Error al aplicar la oferta")
      }
    } catch (error) {
      setMessage("Error al aplicar la oferta")
      console.error("Apply sale error:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeProduct = (codigo: string) => {
    setProducts((prev) => prev.filter((p) => p.codigo !== codigo))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Gestión de Ofertas</h1>
        <p className="text-gray-600">Busca productos por código y agrégalos a ofertas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Productos</CardTitle>
          <CardDescription>
            Ingresa los códigos de productos separados por comas, punto y coma o saltos de línea
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="codes">Códigos de Productos</Label>
            <Textarea
              id="codes"
              placeholder="00346980021&#10;00346980022&#10;00346980023"
              value={codes}
              onChange={(e) => setCodes(e.target.value)}
              rows={6}
            />
          </div>

          <Button onClick={searchProducts} disabled={loading || !codes.trim()}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Buscando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Buscar Productos
              </>
            )}
          </Button>

          {message && (
            <Alert className={message.includes("Error") ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
              <AlertDescription className={message.includes("Error") ? "text-red-700" : "text-green-700"}>
                {message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos Encontrados ({products.length})</CardTitle>
            <CardDescription>Revisa los productos y configura la oferta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {products.map((product) => (
                <div key={product.codigo} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{product.codigo}</Badge>
                      <Badge variant="secondary">{product.marca.nombre}</Badge>
                    </div>
                    <h3 className="font-medium mt-1">{product.nombre}</h3>
                    <p className="text-sm text-gray-600">
                      Precio: ${product.precio.toFixed(2)} | Stock: {product.stock}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => removeProduct(product.codigo)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount">Porcentaje de Descuento (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="1"
                    max="90"
                    placeholder="20"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={applySale} disabled={loading || !discount} className="w-full">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Aplicando...
                      </>
                    ) : (
                      <>
                        <Tag className="h-4 w-4 mr-2" />
                        Aplicar Oferta
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
