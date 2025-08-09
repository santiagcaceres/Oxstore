"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  LayoutDashboard,
  ShoppingBag,
  Settings,
  ImageIcon,
  LogOut,
  Package,
  TrendingUp,
  Upload,
  Stethoscope,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminUser {
  id: string
  email: string
  name: string
  role: "admin" | "manager"
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("oxstore_admin_token")
    const userData = localStorage.getItem("oxstore_admin_user")

    if (token === "authenticated" && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Error parsing user data:", error)
        router.push("/admin/login")
      }
    } else if (pathname !== "/admin/login") {
      router.push("/admin/login")
    }
    setIsLoading(false)
  }, [router, pathname])

  const logout = () => {
    localStorage.removeItem("oxstore_admin_token")
    localStorage.removeItem("oxstore_admin_user")
    setUser(null)
    router.push("/admin/login")
  }

  // Si es la página de login, renderizar sin layout
  if (pathname === "/admin/login") {
    return <div className="min-h-screen">{children}</div>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const menuItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/pedidos", icon: ShoppingBag, label: "Pedidos" },
    { href: "/admin/productos", icon: Package, label: "Productos" },
    { href: "/admin/productos/subir", icon: Upload, label: "Subir Productos" },
    { href: "/admin/banners", icon: ImageIcon, label: "Banners" },
    { href: "/admin/ventas", icon: TrendingUp, label: "Reportes" },
    { href: "/admin/diagnostico", icon: Stethoscope, label: "Diagnóstico" },
    { href: "/admin/configuracion", icon: Settings, label: "Configuración" },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="relative w-32 h-8">
            <Image src="/logo-claro.png" alt="OXSTORE Admin" fill className="object-contain" priority />
          </div>
          <p className="text-gray-300 text-sm mt-2">{user.name}</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors ${
                    pathname === item.href ? "bg-gray-800" : ""
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link href="/" className="block mb-3">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
              Ver Tienda →
            </Button>
          </Link>
          <Button onClick={logout} variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
            <LogOut className="h-5 w-5 mr-3" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-black">Panel de Administración</h2>
            <div className="text-sm text-gray-600">
              Conectado como: <span className="font-medium">{user.email}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
