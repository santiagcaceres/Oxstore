import type React from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  Package,
  Upload,
  Tag,
  ImageIcon,
  ShoppingBag,
  Stethoscope,
  Settings,
  LogOut,
} from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 text-white min-h-screen">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

            <nav className="space-y-2">
              <Link
                href="/admin"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/admin/productos"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Package className="h-5 w-5" />
                <span>Productos</span>
              </Link>

              <Link
                href="/admin/productos-stock"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ml-4"
              >
                <Package className="h-4 w-4" />
                <span>Con Stock</span>
              </Link>

              <Link
                href="/admin/productos/imagenes"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ml-4"
              >
                <Upload className="h-4 w-4" />
                <span>Subir Imágenes</span>
              </Link>

              <Link
                href="/admin/marcas"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Tag className="h-5 w-5" />
                <span>Marcas</span>
              </Link>

              <Link
                href="/admin/banners"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <ImageIcon className="h-5 w-5" />
                <span>Banners</span>
              </Link>

              <Link
                href="/admin/pedidos"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Pedidos</span>
              </Link>

              <Link
                href="/admin/zureo-api"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span>API Zureo</span>
              </Link>

              <Link
                href="/admin/diagnostico"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Stethoscope className="h-5 w-5" />
                <span>Diagnóstico</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <header className="bg-white shadow-sm border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">Panel de Administración</h1>
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <LogOut className="h-4 w-4" />
                <span>Volver a la tienda</span>
              </Link>
            </div>
          </header>

          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
