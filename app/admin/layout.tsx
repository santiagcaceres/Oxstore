"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Package, ImageIcon, LogOut } from "lucide-react"
import { useAdmin } from "@/context/admin-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading, logout } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/admin/login")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

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

              {/* 
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
              */}

              <Link
                href="/admin/banners"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <ImageIcon className="h-5 w-5" />
                <span>Banners</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <header className="bg-white shadow-sm border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">Panel de Administración</h1>
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <span>Volver a la tienda</span>
                </Link>
                <button onClick={logout} className="flex items-center space-x-2 text-red-600 hover:text-red-800">
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </header>

          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
