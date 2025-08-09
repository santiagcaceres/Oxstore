"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Trash2, Tag, Check } from "lucide-react"

interface Product {
  id: number
  codigo: string
  nombre: string
  marca: {
    nombre: string
  }
  precio: number
  stock: number
  onSale?: boolean
  salePrice?: number
}

export default function SaleManagementPage() {
  const [searchCodes, setSearchCodes] = useState("")
  const [foundProducts, setFoundProducts] = useState<Product[]>([])
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [salePercentage, setSalePercentage] = useState(20)

  const searchProductsByCodes = async () => {
    if (!searchCodes.trim()) return

    setIsSearching(true)
    const codes = searchCodes
      .split(/[,\n\s]+/)
      .map((code) => code.trim())
      .filter((code) => code.length > 0)

    try {
      const response = await fetch("/api/products/search-by-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ codes }),
      })

      const data = await response.json()

      if (data.success) {
        setFoundProducts(data.products || [])
      } else {
        alert("Error buscando productos: " + data.message)
      }
    } catch (error) {
      console.error("Error searching products:", error)
      alert("Error de conexión al buscar productos")
    } finally {
      setIsSearching(false)
    }
  }

  const addToSale = (product: Product) => {
    const salePrice = product.precio * (1 - salePercentage / 100)
    const saleProduct = {
      ...product,
      onSale: true,
      salePrice: Math.round(salePrice * 100) / 100,
    }

    setSaleProducts((prev) => {
      const exists = prev.find((p) => p.id === product.id)
      if (exists) return prev
      return [...prev, saleProduct]
    })

    // Remover de productos encontrados
    setFoundProducts((prev) => prev.filter((p) => p.id !== product.id))
  }

  const removeFromSale = (productId: number) => {
    const product = saleProducts.find((p) => p.id === productId)
    if (product) {
      // Volver a agregar a productos encontrados
      setFoundProducts((prev) => [...prev, { ...product, onSale: false, salePrice: undefined }])
    }

    setSaleProducts((prev) => prev.filter((p) => p.id !== productId))
  }

  const applySaleToAll = async () => {
    if (saleProducts.length === 0) {
      alert("No hay productos en la lista de ofertas")
      return
    }

    try {
      const response = await fetch("/api/products/apply-sale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products: saleProducts.map((p) => ({
            id: p.id,
            codigo: p.codigo,
            salePrice: p.salePrice,
            originalPrice: p.precio,
          })),
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`¡Oferta aplicada a ${saleProducts.length} productos!`)
        setSaleProducts([])
        setFoundProducts([])
        setSearchCodes("")
      } else {
        alert("Error aplicando ofertas: " + data.message)
      }
    } catch (error) {
      console.error("Error applying sale:", error)
      alert("Error de conexión al aplicar ofertas")
    }
  }

  const clearSale = () => {
    // Mover todos los productos de sale de vuelta a found
    setFoundProducts((prev) => [...prev, ...saleProducts.map((p) => ({ ...p, onSale: false, salePrice: undefined }))])
    setSaleProducts([])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Gestión de Ofertas</h1>
        <p className="text-gray-600 mt-2">Busca productos por código y agrégalos a ofertas especiales</p>
      </div>

      {/* Configuración de descuento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Configuración de Descuento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Porcentaje de descuento:</label>
            <Input
              type="number"
              value={salePercentage}
              onChange={(e) => setSalePercentage(Number(e.target.value))}
              className="w-20"
              min="1"
              max="90"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        </CardContent>
      </Card>

      {/* Búsqueda por códigos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Productos por Código
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Códigos de productos (separados por comas, espacios o líneas)
            </label>
            <Textarea
              placeholder="Ej: 00346980021, 00346980022, 00346980023..."
              value={searchCodes}
              onChange={(e) => setSearchCodes(e.target.value)}
              rows={4}
            />
          </div>
          <Button
            onClick={searchProductsByCodes}
            disabled={isSearching || !searchCodes.trim()}
            className="bg-black hover:bg-gray-800"
          >
            {isSearching ? (
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
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Productos encontrados */}
        <Card>
          <CardHeader>
            <CardTitle>Productos Encontrados ({foundProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {foundProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay productos encontrados</p>
                <p className="text-sm">Busca productos usando sus códigos</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {foundProducts.map((product) => (
                  <div key={product.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{product.nombre}</h4>
                        <p className="text-sm text-gray-500">Código: {product.codigo}</p>
                        <Badge variant="outline">{product.marca.nombre}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${product.precio.toFixed(2)}</p>
                        <p className="text-sm text-green-600">
                          Oferta: ${(product.precio * (1 - salePercentage / 100)).toFixed(2)}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => addToSale(product)}
                          className="mt-2 bg-black hover:bg-gray-800"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Productos en oferta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Productos en Oferta ({saleProducts.length})</span>
              {saleProducts.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearSale}>
                  Limpiar Todo
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {saleProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay productos en oferta</p>
                <p className="text-sm">Agrega productos desde la búsqueda</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                  {saleProducts.map((product) => (
                    <div key={product.id} className="p-3 border rounded-lg bg-red-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{product.nombre}</h4>
                          <p className="text-sm text-gray-500">Código: {product.codigo}</p>
                          <Badge variant="outline">{product.marca.nombre}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 line-through">${product.precio.toFixed(2)}</p>
                          <p className="font-bold text-red-600">${product.salePrice?.toFixed(2)}</p>
                          <p className="text-xs text-green-600">-{salePercentage}%</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromSale(product.id)}
                            className="mt-2"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Quitar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button onClick={applySaleToAll} className="w-full bg-red-600 hover:bg-red-700 text-white" size="lg">
                  <Check className="h-4 w-4 mr-2" />
                  Aplicar Oferta a {saleProducts.length} Productos
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
