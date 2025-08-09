"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, ImageIcon, Tag, Activity } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = localStorage.getItem("admin-authenticated")
      if (adminAuth === "true") {
        setIsAuthenticated(true)
      } else if (pathname !== "/admin/login") {
        router.push("/admin/login")
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, router])

  const handleLogout = () => {
    localStorage.removeItem("admin-authenticated")
    setIsAuthenticated(false)
    router.push("/admin/login")
  }

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
    { name: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
    { name: "Ventas", href: "/admin/ventas", icon: Users },
    { name: "Diagnóstico", href: "/admin/diagnostico", icon: Activity },
    { name: "Configuración", href: "/admin/configuracion", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-black text-white min-h-screen">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <Image src="/logo-claro.png" alt="OX Store" width={40} height={40} className="object-contain" />
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive ? "bg-white text-black" : "text-gray-300 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full text-white border-gray-600 hover:bg-gray-800 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">{children}</div>
      </div>
    </div>
  )
}
