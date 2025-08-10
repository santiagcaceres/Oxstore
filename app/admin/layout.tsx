"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  ImageIcon,
  Tag,
  Activity,
  Building,
} from "lucide-react"
import { useAdmin } from "@/context/admin-context"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, isLoading } = useAdmin()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== "/admin/login") {
      router.push("/admin/login")
    }
  }, [isAuthenticated, isLoading, pathname, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!isAuthenticated && pathname !== "/admin/login") {
    return null
  }

  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-gray-100">{children}</div>
  }

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Productos", href: "/admin/productos", icon: Package },
    { name: "Subir Imágenes", href: "/admin/productos/imagenes", icon: ImageIcon },
    { name: "Gestión Sale", href: "/admin/productos/sale", icon: Tag },
    { name: "Banners", href: "/admin/banners", icon: ImageIcon },
    { name: "Marcas", href: "/admin/marcas", icon: Building },
    { name: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
    { name: "Diagnóstico", href: "/admin/diagnostico", icon: Activity },
    { name: "Configuración", href: "/admin/configuracion", icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image src="/logo-claro.png" alt="OXSTORE Admin" fill className="object-contain" />
            </div>
            <h1 className="text-lg font-bold">Admin Panel</h1>
          </Link>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive ? "bg-white text-black" : "text-gray-300 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <Button
            asChild
            variant="outline"
            className="w-full justify-start text-white border-gray-600 hover:bg-gray-800 bg-transparent"
          >
            <Link href="/" target="_blank">
              Ver Tienda →
            </Link>
          </Button>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full justify-start text-white border-gray-600 hover:bg-gray-800 bg-transparent"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  )
}
