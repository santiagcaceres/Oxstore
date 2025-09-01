"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Package, ShoppingCart, Users, Eye, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface DashboardStats {
  totalProducts: number
  productsWithStock: number
  totalValue: number
  featuredProducts: number
  topProducts: Array<{
    id: number
    name: string
    price: number
    stock_quantity: number
    sales_count: number
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    productsWithStock: 0,
    totalValue: 0,
    featuredProducts: 0,
    topProducts: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data: products } = await supabase
        .from("products")
        .select("*")
        .order("stock_quantity", { ascending: false })

      if (products) {
        const productsWithStock = products.filter((p) => p.stock_quantity > 0)
        const totalValue = productsWithStock.reduce((sum, p) => sum + p.price * p.stock_quantity, 0)
        const featuredProducts = products.filter((p) => p.is_featured).length

        setStats({
          totalProducts: products.length,
          productsWithStock: productsWithStock.length,
          totalValue,
          featuredProducts,
          topProducts: productsWithStock.slice(0, 3).map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            stock_quantity: p.stock_quantity,
            sales_count: 0, // No tenemos datos de ventas aún
          })),
        })
      }
    } catch (error) {
      console.error("Error loading dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general de tu tienda con datos reales</p>
        </div>
        <Button onClick={loadDashboardStats} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Stock</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Valor total del inventario disponible</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos con Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.productsWithStock}</div>
            <div className="text-xs text-muted-foreground">De {stats.totalProducts} productos totales</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Destacados</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.featuredProducts}</div>
            <div className="text-xs text-muted-foreground">Productos marcados como destacados</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistema de Pagos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">MercadoPago</div>
            <div className="text-xs text-green-600">✓ Configurado y listo</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products by Stock */}
        <Card>
          <CardHeader>
            <CardTitle>Productos con Mayor Stock</CardTitle>
            <CardDescription>Los productos con más unidades disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Cargando productos...</p>
              </div>
            ) : stats.topProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.stock_quantity} unidades</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${product.price.toLocaleString()}</p>
                      <Progress value={Math.min((product.stock_quantity / 100) * 100, 100)} className="w-16 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No hay productos disponibles</p>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
            <CardDescription>Información sobre la integración con Zureo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">API Zureo</p>
                  <p className="text-xs text-muted-foreground">Sincronización automática cada 24h</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Activo</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">MercadoPago</p>
                  <p className="text-xs text-muted-foreground">Pagos configurados</p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Configurado</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Banners</p>
                  <p className="text-xs text-muted-foreground">Gestión de banners activa</p>
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-800">Listo</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Tareas comunes para gestionar tu tienda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col space-y-2" onClick={() => window.open("/", "_blank")}>
              <Eye className="h-6 w-6" />
              <span>Ver Tienda</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2 bg-transparent"
              onClick={() => (window.location.href = "/admin/productos")}
            >
              <Package className="h-6 w-6" />
              <span>Gestionar Productos</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2 bg-transparent"
              onClick={() => (window.location.href = "/admin/banners")}
            >
              <ShoppingCart className="h-6 w-6" />
              <span>Configurar Banners</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
