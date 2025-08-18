"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/context/cart-context"

interface ZureoBrand {
  id: string
  nombre: string
  name: string
  descripcion?: string
  description?: string
  activo: boolean
  active: boolean
}

interface Category {
  name: string
  href: string
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [brands, setBrands] = useState<ZureoBrand[]>([])
  const [brandsLoading, setBrandsLoading] = useState(true)
  const { state } = useCart()

  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0)

  const allowedBrands = [
    "MISTRAL",
    "UNIFORM",
    "LEVIS",
    "KETZIA",
    "INDIAN",
    "KABOA",
    "EMPATHIA",
    "ROTUNDA",
    "LEMON",
    "GATTO PARDO",
    "MINOT",
    "MANDAL",
    "SYMPHORI",
    "NEUFO",
    "BROOKSFIELD",
    "PEGUIN",
  ]

  const categories: Category[] = [
    {
      name: "Hombre",
      href: "/hombre",
    },
    {
      name: "Mujer",
      href: "/mujer",
    },
    {
      name: "Accesorios",
      href: "/accesorios",
    },
    {
      name: "Sale",
      href: "/sale",
    },
    {
      name: "Nuevo",
      href: "/nuevo",
    },
  ]

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setBrandsLoading(true)
        const response = await fetch("/api/zureo/brands")
        if (response.ok) {
          const data = await response.json()
          setBrands(data || [])
        } else {
          console.warn("Error fetching brands:", response.status)
          setBrands([]) // Set empty array instead of failing
        }
      } catch (error) {
        console.warn("Error fetching brands:", error)
        setBrands([]) // Set empty array instead of failing
      } finally {
        setBrandsLoading(false)
      }
    }

    fetchBrands()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/buscar?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const activeBrands = brands
    .filter((brand) => {
      const brandName = (brand.nombre || brand.name || "").toUpperCase()
      return (brand.activo || brand.active) && allowedBrands.includes(brandName)
    })
    .map((brand) => ({
      ...brand,
      displayName: (brand.nombre || brand.name || "").toUpperCase(),
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .filter(
      (brand, index, self) =>
        index === self.findIndex((b) => b.displayName.toUpperCase() === brand.displayName.toUpperCase()),
    )

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black shadow-xl border-b border-gray-800" : "bg-white/90 backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex-shrink-0 flex items-center h-full">
            <div className="relative h-10 w-auto md:h-12 mt-2">
              <Image
                src={isScrolled ? "/logo-claro.png" : "/logo-oscuro.png"}
                alt="OX Store"
                width={140}
                height={48}
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Navegación centrada */}
          <nav className="hidden md:flex items-center space-x-8 h-full">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className={`font-medium transition-all duration-300 relative group py-2 ${
                  isScrolled ? "text-white hover:text-gray-300" : "text-black hover:text-gray-600"
                }`}
              >
                {category.name}
                <span
                  className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                    isScrolled ? "bg-white" : "bg-black"
                  }`}
                ></span>
              </Link>
            ))}

            <div className="relative group">
              <button
                className={`font-medium flex items-center py-2 transition-all duration-300 relative ${
                  isScrolled ? "text-white hover:text-gray-300" : "text-black hover:text-gray-600"
                }`}
              >
                Marcas
                <span
                  className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                    isScrolled ? "bg-white" : "bg-black"
                  }`}
                ></span>
              </button>

              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-2xl opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-50">
                <div className="py-3">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    {brandsLoading ? "Cargando marcas..." : `Marcas Disponibles (${activeBrands.length})`}
                  </div>
                  {brandsLoading ? (
                    <div className="px-4 py-8 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto"></div>
                    </div>
                  ) : activeBrands.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1 p-2">
                      {activeBrands.map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/marcas/${encodeURIComponent(brand.displayName.toLowerCase())}`}
                          className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-all duration-200 rounded-md hover:translate-x-1"
                        >
                          <div className="font-medium truncate">{brand.displayName}</div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">No hay marcas disponibles</div>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* Controles derechos */}
          <div className="flex items-center space-x-4">
            {/* Buscador Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-white border-gray-300 focus:border-black focus:ring-black rounded-full pl-4 pr-12"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black hover:bg-gray-800 rounded-full h-8 w-8 p-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Carrito */}
            <Link href="/carrito">
              <Button variant="ghost" size="sm" className="relative hover:bg-gray-100 rounded-full">
                <ShoppingCart className={`h-5 w-5 ${isScrolled ? "text-white" : "text-black"}`} />
                {itemCount > 0 && (
                  <span
                    className={`absolute -top-2 -right-2 text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium ${
                      isScrolled ? "bg-white text-black" : "bg-black text-white"
                    }`}
                  >
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Menú Mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden hover:bg-gray-100 rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className={`h-5 w-5 ${isScrolled ? "text-white" : "text-black"}`} />
              ) : (
                <Menu className={`h-5 w-5 ${isScrolled ? "text-white" : "text-black"}`} />
              )}
            </Button>
          </div>
        </div>

        {/* Menú Mobile */}
        {isMobileMenuOpen && (
          <div
            className={`md:hidden border-t backdrop-blur-md ${
              isScrolled ? "border-gray-700 bg-black/95" : "border-gray-200 bg-white/95"
            }`}
          >
            <div className="py-4 space-y-4">
              {/* Buscador Mobile */}
              <form onSubmit={handleSearch} className="px-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-black focus:ring-black rounded-full pl-4 pr-12"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black hover:bg-gray-800 rounded-full h-8 w-8 p-0"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>

              {/* Navegación Mobile */}
              <nav className="px-2 space-y-1">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className={`block font-medium py-3 px-4 rounded-lg transition-colors ${
                      isScrolled
                        ? "text-white hover:text-gray-300 hover:bg-gray-800"
                        : "text-black hover:text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}

                {activeBrands.length > 0 && (
                  <div className={`border-t pt-4 mt-4 ${isScrolled ? "border-gray-700" : "border-gray-200"}`}>
                    <div
                      className={`font-semibold py-2 px-4 text-sm uppercase tracking-wide ${
                        isScrolled ? "text-white" : "text-black"
                      }`}
                    >
                      Marcas ({activeBrands.length})
                    </div>
                    <div className="space-y-1">
                      {activeBrands.map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/marcas/${encodeURIComponent(brand.displayName.toLowerCase())}`}
                          className={`block text-sm py-2 px-6 rounded-lg transition-colors ${
                            isScrolled
                              ? "text-gray-300 hover:text-white hover:bg-gray-800"
                              : "text-gray-600 hover:text-black hover:bg-gray-50"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {brand.displayName}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
