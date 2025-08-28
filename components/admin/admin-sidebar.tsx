"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  ImageIcon,
  Users,
  Settings,
  BarChart3,
  RefreshCw,
  Bug,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Productos",
    href: "/admin/productos",
    icon: Package,
  },
  {
    name: "Categorías",
    href: "/admin/categorias",
    icon: FolderOpen,
  },
  {
    name: "Pedidos",
    href: "/admin/pedidos",
    icon: ShoppingCart,
  },
  {
    name: "Banners",
    href: "/admin/banners",
    icon: ImageIcon,
  },
  {
    name: "Sincronizar",
    href: "/admin/sincronizar",
    icon: RefreshCw,
  },
  {
    name: "Zureo Debug",
    href: "/admin/zureo-debug",
    icon: Bug,
  },
  {
    name: "Clientes",
    href: "/admin/clientes",
    icon: Users,
  },
  {
    name: "Reportes",
    href: "/admin/reportes",
    icon: BarChart3,
  },
  {
    name: "Configuración",
    href: "/admin/configuracion",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="text-2xl font-bold text-sidebar-primary">OXSTORE</div>
        </Link>
        <p className="text-sm text-sidebar-foreground/60 mt-1">Panel de Administración</p>
      </div>

      <nav className="px-4 pb-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
