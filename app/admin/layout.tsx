import Link from "next/link"
import {
  LayoutDashboard,
  Package,
  Upload,
  Percent,
  Tag,
  ImageIcon,
  ShoppingBag,
  BarChart3,
  Stethoscope,
} from "your-icon-library" // Import your icon library here

const AdminLayout = () => {
  return (
    <div className="flex">
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

        {/* Agregando enlace al panel de API Zureo */}
        <Link
          href="/admin/zureo-api"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Package className="h-5 w-5" />
          <span>API Zureo</span>
        </Link>
      </nav>

      {/* Main content area */}
      <main className="flex-1 p-4">{/* Your main content goes here */}</main>
    </div>
  )
}

export default AdminLayout
