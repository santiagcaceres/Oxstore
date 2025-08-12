"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/context/cart-context"

interface Brand {
  id: number
  descripcion: string
}

interface Category {
  name: string
  href: string
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [brands, setBrands] = useState<Brand[]>([])
  const { state } = useCart()

  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0)

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
        isScrolled ? "bg-white shadow-lg" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="relative h-10 w-auto md:h-12">
              <Image
                src="/logo-oscuro.png"
                alt="OX Store"
                width={120}
                height={48}
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            {categories.map((category) => (
              <Link key={category.name} href={category.href} className="text-black hover:text-gray-600 font-medium">
                {category.name}
              </Link>
            ))}

            {brands.length > 0 && (
              <div className="relative group">
                <button className="text-black hover:text-gray-600 font-medium flex items-center py-2">
                  Marcas
                  <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
                </button>

                {/* Dropdown con hover */}
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="max-h-80 overflow-y-auto py-2">
                    {brands.map((brand) => (
                      <Link
                        key={brand.id}
                        href={`/marcas/${encodeURIComponent(brand.descripcion.toLowerCase())}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
                      >
                        {brand.descripcion}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </nav>

          {/* Buscador y Carrito */}
          <div className="flex items-center space-x-4">
            {/* Buscador Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-white border-gray-300 focus:border-black focus:ring-black"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black hover:bg-gray-800"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Carrito */}
            <Link href="/carrito">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5 text-black" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Menú Mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Menú Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              {/* Buscador Mobile */}
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="relative w-full">
                  <Input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-black focus:ring-black"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black hover:bg-gray-800"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>

              {/* Navegación Mobile */}
              <nav className="flex flex-col space-y-2">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="text-black hover:text-gray-600 font-medium py-2 block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}

                {brands.length > 0 && (
                  <div>
                    <div className="text-black font-medium py-2">Marcas</div>
                    <div className="ml-4 space-y-1 max-h-32 overflow-y-auto">
                      {brands.slice(0, 10).map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/marcas/${encodeURIComponent(brand.descripcion.toLowerCase())}`}
                          className="text-gray-600 hover:text-black text-sm py-1 block"
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
