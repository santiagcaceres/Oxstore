"use client"

import { useState, useEffect } from "react"
import { DollarSign, Package, TrendingUp, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardStats {
  totalProductos: number
  productosConStock: number
  valorTotalInventario: number
  ventasDelMes: number
}

interface ProductWithStock {
  codigo: string
  nombre: string
  marca: { nombre: string }
  stock: number
  precio: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProductos: 0,
    productosConStock: 0,
    valorTotalInventario: 0,
    ventasDelMes: 0, // Siempre será 0 ya que no hay sistema de ventas
  })

  const [productsWithStock, setProductsWithStock] = useState<ProductWithStock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      console.log("[v0] Cargando datos reales del dashboard desde Zureo")
      setLoading(true)
      setError("")

      const response = await fetch("/api/zureo/products-with-stock")
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Error cargando productos")
      }

      console.log("[v0] Datos recibidos:", {
        total: data.totalProducts,
        conStock: data.productsWithStock,
        valor: data.totalStockValue,
      })

      setStats({
        totalProductos: data.totalProducts || 0,
        productosConStock: data.productsWithStock || 0,
        valorTotalInventario: data.totalStockValue || 0,
        ventasDelMes: 0, // Siempre 0 porque no hay sistema de ventas
      })

      // Mostrar los primeros 5 productos para la sección de recientes
      setProductsWithStock((data.data || []).slice(0, 5))
    } catch (error) {
      console.error("[v0] Error cargando dashboard:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")

      setStats({
        totalProductos: 0,
        productosConStock: 0,
        valorTotalInventario: 0,
        ventasDelMes: 0,
      })
      setProductsWithStock([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <span className="ml-3 text-gray-600">Cargando datos reales de Zureo...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">Última actualización: {new Date().toLocaleString()}</div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <span className="text-red-800 font-medium">Error de conexión: </span>
            <span className="text-red-700">{error}</span>
            <div className="text-sm text-red-600 mt-1">
              Mostrando valores en 0. Verifica las credenciales de Zureo en las variables de entorno.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProductos.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Productos en catálogo Zureo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productosConStock.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Productos disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.valorTotalInventario.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Valor total del stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ventasDelMes}</div>
            <p className="text-xs text-muted-foreground">Sin sistema de ventas</p>
          </CardContent>
        </Card>
      </div>

      {productsWithStock.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos Recientes con Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productsWithStock.map((product) => (
                <div key={product.codigo} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-semibold">{product.codigo}</p>
                        <p className="text-sm text-gray-600">{product.nombre}</p>
                      </div>
                      <div>
                        <p className="font-semibold">{product.marca.nombre}</p>
                        <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold">${product.precio.toLocaleString()}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.stock > 10
                          ? "bg-green-100 text-green-600"
                          : product.stock > 0
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                      }`}
                    >
                      {product.stock > 10 ? "Alto Stock" : product.stock > 0 ? "Bajo Stock" : "Sin Stock"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
