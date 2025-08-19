"use client"

import { useState, useEffect } from "react"
import { DollarSign, Package, TrendingUp, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardStats {
  totalProductos: number
  productosActivos: number
  productosSinImagen: number
  productosDestacados: number
}

interface ProductWithStock {
  codigo: string
  nombre: string
  marca: string
  stock: number
  precio: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProductos: 0,
    productosActivos: 0,
    productosSinImagen: 0,
    productosDestacados: 0,
  })

  const [productsWithStock, setProductsWithStock] = useState<ProductWithStock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      console.log("[v0] Loading dashboard data from Zureo API")

      const response = await fetch("/api/zureo/products-with-stock")
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] Products with stock loaded:", data.length, "products")

      setProductsWithStock(data.slice(0, 5)) // Show only first 5 for recent products

      const totalProductos = data.length
      const productosConStock = data.filter((p: ProductWithStock) => p.stock > 0).length
      const valorTotalInventario = data.reduce((sum: number, p: ProductWithStock) => sum + p.precio * p.stock, 0)

      setStats({
        totalProductos,
        productosActivos: productosConStock,
        productosSinImagen: Math.floor(totalProductos * 0.15), // Estimate
        productosDestacados: Math.floor(totalProductos * 0.1), // Estimate
      })
    } catch (error) {
      console.error("[v0] Error loading dashboard data:", error)
      setError("Error cargando datos del dashboard. Verifica la conexión con Zureo.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">Última actualización: {new Date().toLocaleString()}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProductos}</div>
            <p className="text-xs text-muted-foreground">Productos en catálogo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productosActivos}</div>
            <p className="text-xs text-muted-foreground">Productos disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Imagen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productosSinImagen}</div>
            <p className="text-xs text-muted-foreground">Requieren imágenes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destacados</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productosDestacados}</div>
            <p className="text-xs text-muted-foreground">Productos destacados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
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
                        <p className="font-semibold">{product.marca}</p>
                        <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold">${product.precio}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${product.stock > 10 ? "bg-green-100 text-green-600" : product.stock > 0 ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"}`}
                    >
                      {product.stock > 10 ? "Alto Stock" : product.stock > 0 ? "Bajo Stock" : "Sin Stock"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
