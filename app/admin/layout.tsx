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
  ShoppingCart,
  LogOut,
  Upload,
  ImageIcon,
  Stethoscope,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Productos", href: "/admin/productos" },
  { icon: Upload, label: "Subir Producto", href: "/admin/productos/subir" },
  { icon: ShoppingCart, label: "Pedidos", href: "/admin/pedidos" },
  { icon: TrendingUp, label: "Ventas", href: "/admin/ventas" },
  { icon: ImageIcon, label: "Banners", href: "/admin/banners" },
  { icon: Stethoscope, label: "Diagnóstico", href: "/admin/diagnostico" },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, logout } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-black text-white">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-gray-800">
            <Image src="/logo-claro.png" alt="OXSTORE Admin" width={120} height={40} className="h-8 w-auto" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-800">
            <Button
              onClick={logout}
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
