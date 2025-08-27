import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, TrendingDown, Eye } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de tu tienda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +20.1% desde el mes pasado
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +180.1% desde el mes pasado
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +19% desde el mes pasado
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -2% desde el mes pasado
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>Los últimos pedidos realizados en tu tienda</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">#3210</TableCell>
                  <TableCell>María García</TableCell>
                  <TableCell>
                    <Badge variant="default">Procesando</Badge>
                  </TableCell>
                  <TableCell className="text-right">$89.99</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">#3209</TableCell>
                  <TableCell>Juan Pérez</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Enviado</Badge>
                  </TableCell>
                  <TableCell className="text-right">$156.50</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">#3208</TableCell>
                  <TableCell>Ana López</TableCell>
                  <TableCell>
                    <Badge variant="outline">Entregado</Badge>
                  </TableCell>
                  <TableCell className="text-right">$234.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>Los productos con mejor rendimiento este mes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-lg" />
                <div>
                  <p className="text-sm font-medium">Camiseta Básica Mujer</p>
                  <p className="text-xs text-muted-foreground">234 vendidas</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">$29.99</p>
                <Progress value={85} className="w-16 h-2" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-lg" />
                <div>
                  <p className="text-sm font-medium">Jeans Slim Fit Hombre</p>
                  <p className="text-xs text-muted-foreground">189 vendidos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">$79.99</p>
                <Progress value={72} className="w-16 h-2" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-lg" />
                <div>
                  <p className="text-sm font-medium">Vestido Floral Niña</p>
                  <p className="text-xs text-muted-foreground">156 vendidos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">$45.99</p>
                <Progress value={58} className="w-16 h-2" />
              </div>
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
            <Button className="h-20 flex-col space-y-2">
              <Package className="h-6 w-6" />
              <span>Agregar Producto</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <Eye className="h-6 w-6" />
              <span>Ver Tienda</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <ShoppingCart className="h-6 w-6" />
              <span>Gestionar Pedidos</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
