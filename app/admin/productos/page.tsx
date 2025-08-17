"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Eye, Edit, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const MOCK_PRODUCTS = [
  {
    codigo: "LEV001",
    nombre: "Jean 724 High Rise Straight",
    marca: "LEVIS",
    precio: 4081.96,
    stock: 5,
    categoria: "Pantalones",
    descripcion: "Jean de tiro alto con corte recto, ideal para uso diario",
  },
  {
    codigo: "GAT001",
    nombre: "Blusa agujeros",
    marca: "GATTO PARDO",
    precio: 1795.08,
    stock: 3,
    categoria: "Blusas",
    descripcion: "Blusa moderna con detalles de agujeros decorativos",
  },
  {
    codigo: "LEV002",
    nombre: "511 slim",
    marca: "LEVIS",
    precio: 3270.49,
    stock: 8,
    categoria: "Pantalones",
    descripcion: "Jean corte slim fit, cómodo y moderno",
  },
]

interface ZureoProduct {
  codigo: string
  nombre: string
  marca: string
  precio: number
  stock: number
  categoria: string
  descripcion?: string
}

export default function ProductosPage() {
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [products] = useState<ZureoProduct[]>(MOCK_PRODUCTS)
  const [error] = useState<string | null>(null)

  const loadProducts = async () => {
    setLoading(true)
    // Simulate loading
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const filteredProducts = products.filter(
    (product) =>
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const productsWithStock = filteredProducts.filter((product) => product.stock > 0)
  const completeProducts = filteredProducts.filter((product) => product.marca && product.nombre && product.descripcion)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {products.length} productos cargados
          </Badge>
          <Button onClick={loadProducts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Cargando..." : "Actualizar"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Mostrando datos de demostración. Los productos reales se cargarán cuando se resuelvan los problemas de
          conectividad con Zureo.
        </AlertDescription>
      </Alert>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, marca o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="stock" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stock">Con Stock ({productsWithStock.length})</TabsTrigger>
          <TabsTrigger value="complete">Completos ({completeProducts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Productos con Stock Disponible</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Cargando productos...</div>
              ) : productsWithStock.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No se encontraron productos con stock</div>
              ) : (
                <div className="grid gap-4">
                  {productsWithStock.map((product) => (
                    <div key={product.codigo} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.nombre}</h3>
                          <p className="text-sm text-gray-600">
                            {product.marca} • Código: {product.codigo}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline">Stock: {product.stock}</Badge>
                            <Badge variant="secondary">${product.precio}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complete" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Productos Completos</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Cargando productos...</div>
              ) : completeProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron productos completos (con marca, nombre y descripción)
                </div>
              ) : (
                <div className="grid gap-4">
                  {completeProducts.map((product) => (
                    <div key={product.codigo} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.nombre}</h3>
                          <p className="text-sm text-gray-600">
                            {product.marca} • Código: {product.codigo}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">{product.descripcion}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline">Stock: {product.stock}</Badge>
                            <Badge variant="secondary">${product.precio}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
