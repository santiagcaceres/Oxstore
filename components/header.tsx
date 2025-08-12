"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/context/cart-context"
import type { Brand, Category } from "@/types"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [brands, setBrands] = useState<Brand[]>([])
  const { state } = useCart()

  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0)

  const categories: Category[] = [
    {
      name: "Home",
      href: "/",
    },
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
        const response = await fetch("/api/zureo/brands")
        if (response.ok) {
          const data = await response.json()
          setBrands(data.brands || [])
        }
      } catch (error) {
        console.error("Error fetching brands:", error)
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
                className={`font-medium transition-colors relative group flex items-center h-full ${
                  isScrolled ? "text-white hover:text-gray-300" : "text-black hover:text-gray-600"
                }`}
              >
                {category.name}
                <span
                  className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full ${
                    isScrolled ? "bg-white" : "bg-black"
                  }`}
                ></span>
              </Link>
            ))}

            {brands.length > 0 && (
              <div className="relative group h-full flex items-center">
                <button
                  className={`font-medium flex items-center py-2 transition-colors relative ${
                    isScrolled ? "text-white hover:text-gray-300" : "text-black hover:text-gray-600"
                  }`}
                >
                  Marcas
                  <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
                  <span
                    className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full ${
                      isScrolled ? "bg-white" : "bg-black"
                    }`}
                  ></span>
                </button>

                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="max-h-80 overflow-y-auto py-3">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                      Todas las Marcas
                    </div>
                    {brands.map((brand) => (
                      <Link
                        key={brand.id}
                        href={`/marcas/${encodeURIComponent(brand.descripcion.toLowerCase())}`}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors border-b border-gray-50 last:border-b-0"
                      >
                        {brand.descripcion}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
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

                {brands.length > 0 && (
                  <div className={`border-t pt-4 mt-4 ${isScrolled ? "border-gray-700" : "border-gray-200"}`}>
                    <div
                      className={`font-semibold py-2 px-4 text-sm uppercase tracking-wide ${
                        isScrolled ? "text-white" : "text-black"
                      }`}
                    >
                      Marcas
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {brands.slice(0, 15).map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/marcas/${encodeURIComponent(brand.descripcion.toLowerCase())}`}
                          className={`block text-sm py-2 px-6 rounded-lg transition-colors ${
                            isScrolled
                              ? "text-gray-300 hover:text-white hover:bg-gray-800"
                              : "text-gray-600 hover:text-black hover:bg-gray-50"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {brand.descripcion}
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
