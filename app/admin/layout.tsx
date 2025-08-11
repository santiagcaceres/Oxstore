"use client"

import type React from "react"

import { useAdmin } from "@/context/admin-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
  ExternalLink,
  Upload,
  Tag,
  Percent,
  BarChart3,
  ImageIcon,
  Stethoscope,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, loading } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/admin/login")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin" className="flex items-center space-x-3">
            <div className="relative h-8 w-24">
              <Image src="/logo-claro.png" alt="OX Store Admin" fill className="object-contain" />
            </div>
          </Link>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-2">
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
            href="/admin/productos/imagenes"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ml-4"
          >
            <Upload className="h-4 w-4" />
            <span>Subir Imágenes</span>
          </Link>

          <Link
            href="/admin/productos/sale"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ml-4"
          >
            <Percent className="h-4 w-4" />
            <span>Gestión Sale</span>
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
            href="/admin/ventas"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Ventas</span>
          </Link>

          <Link
            href="/admin/diagnostico"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Stethoscope className="h-5 w-5" />
            <span>Diagnóstico</span>
          </Link>
        </nav>

        {/* Botones inferiores */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link href="/" target="_blank">
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent border-gray-600 text-white hover:bg-gray-800"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Tienda
            </Button>
          </Link>

          <Button
            variant="outline"
            className="w-full justify-start bg-transparent border-gray-600 text-white hover:bg-gray-800"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </div>
    </div>
  )
}
