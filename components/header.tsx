"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Search, ShoppingCart, Menu, User, Heart, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/context/cart-context"
import { getBrandsFromZureo } from "@/lib/zureo-api"

type Brand = {
  id: number
  nombre: string
}

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const { state } = useCart()
  const router = useRouter()

  const totalItems = state?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    const fetchBrands = async () => {
      try {
        const zureoBrands = await getBrandsFromZureo()
        setBrands(zureoBrands || [])
      } catch (error) {
        console.error("Error fetching brands:", error)
        setBrands([])
      }
    }

    fetchBrands()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setIsSearchOpen(false)
    }
  }

  const categories = [
    {
      name: "Hombre",
      href: "/hombre",
      subcategories: [
        { name: "Remeras", href: "/hombre/remeras" },
        { name: "Buzos", href: "/hombre/buzos" },
        { name: "Pantalones", href: "/hombre/pantalones" },
        { name: "Camperas", href: "/hombre/camperas" },
        { name: "Calzado", href: "/hombre/calzado" },
      ],
    },
    {
      name: "Mujer",
      href: "/mujer",
      subcategories: [
        { name: "Remeras", href: "/mujer/remeras" },
        { name: "Buzos", href: "/mujer/buzos" },
        { name: "Pantalones", href: "/mujer/pantalones" },
        { name: "Vestidos", href: "/vestimenta/vestidos" },
        { name: "Faldas", href: "/vestimenta/faldas" },
        { name: "Calzado", href: "/mujer/calzado" },
      ],
    },
    {
      name: "Accesorios",
      href: "/accesorios",
      subcategories: [
        { name: "Gorras", href: "/accesorios/gorras" },
        { name: "Carteras", href: "/accesorios/carteras" },
        { name: "Cinturones", href: "/accesorios/cinturones" },
        { name: "Joyas", href: "/accesorios/joyas" },
        { name: "Relojes", href: "/accesorios/relojes" },
      ],
    },
  ]

  const headerClass = isScrolled 
    ? "bg-black text-white shadow-lg" 
    : "bg-white text-black border-b border-gray-100"

  const logoSrc = isScrolled ? "/logo-claro.png" : "/logo-oscuro.png"

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClass}`}>
      {/* Top Bar */}
      <div className={`border-b ${isScrolled ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="container mx-auto px-4">
          <div className="flex h-10 items-center justify-between text-sm">
            <div className="hidden md:flex items-center space-x-4">
              <span className={isScrolled ? 'text-gray-300' : 'text-gray-600'}>
                Envío gratis en compras superiores a $50.000
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/ofertas" 
                className={`hover:opacity-80 transition-colors ${isScrolled ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Ofertas
              </Link>
              <Link 
                href="/nuevo" 
                className={`hover:opacity-80 transition-colors ${isScrolled ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Nuevo
              </Link>
              <Link 
                href="/sale" 
                className="text-black hover:text-gray-600 transition-colors font-medium"
              >
                Sale
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Logo - Fixed size for mobile */}
          <Link href="/" className="flex items-center">
            <Image 
              src={logoSrc || "/placeholder.svg"} 
              alt="OXSTORE" 
              width={140} 
              height={45} 
              className="h-10 w-auto md:h-12" 
              priority 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {categories.map((category) => (
              <div key={category.name} className="relative group">
                <Link
                  href={category.href}
                  className={`flex items-center gap-1 font-medium hover:opacity-80 transition-colors ${
                    isScrolled ? 'text-white' : 'text-black'
                  }`}
                >
                  {category.name}
                  <ChevronDown className="h-4 w-4" />
                </Link>
                <div className="absolute top-full left-0 bg-white shadow-lg rounded-lg py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link
                    href={category.href}
                    className="block px-4 py-2 text-black hover:bg-gray-50 transition-colors font-medium"
                  >
                    Ver todo en {category.name}
                  </Link>
                  <div className="border-t my-1" />
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className="block px-4 py-2 text-black hover:bg-gray-50 transition-colors"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Brands Dropdown */}
            <div className="relative group">
              <span
                className={`flex items-center gap-1 font-medium cursor-pointer hover:opacity-80 transition-colors ${
                  isScrolled ? 'text-white' : 'text-black'
                }`}
              >
                Marcas
                <ChevronDown className="h-4 w-4" />
              </span>
              <div className="absolute top-full left-0 bg-white shadow-lg rounded-lg py-2 min-w-[200px] max-h-96 overflow-y-auto opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {brands.length > 0 ? (
                  brands.map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/marcas/${encodeURIComponent(brand.nombre)}`}
                      className="block px-4 py-2 text-black hover:bg-gray-50 transition-colors"
                    >
                      {brand.nombre}
                    </Link>
                  ))
                ) : (
                  <span className="block px-4 py-2 text-gray-500">Cargando...</span>
                )}
              </div>
            </div>
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center space-x-2">
            {/* Desktop Search - Always white background */}
            <div className="hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="search"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pr-10 bg-white border-gray-200 text-black placeholder:text-gray-500"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-0 top-0 h-full px-3 text-black hover:text-gray-600"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* Mobile Search Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/perfil">
                <User className="h-5 w-5" />
              </Link>
            </Button>

            {/* Favorites */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/favoritos">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/carrito">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-black text-white text-xs flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar - Always white */}
        {isSearchOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 bg-white border-gray-200 text-black placeholder:text-gray-500"
                autoFocus
              />
              <Button 
                type="submit" 
                size="icon" 
                variant="ghost" 
                className="absolute right-0 top-0 h-full px-3 text-black hover:text-gray-600"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white text-black shadow-lg border-t">
          <div className="container mx-auto px-4 py-6 space-y-4">
            {categories.map((category) => (
              <div key={category.name} className="space-y-2">
                <Link
                  href={category.href}
                  className="block text-lg font-medium hover:text-gray-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
                <div className="pl-4 space-y-1">
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className="block text-gray-600 hover:text-black transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Marcas</h3>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {brands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/marcas/${encodeURIComponent(brand.nombre)}`}
                    className="text-sm text-gray-600 hover:text-black transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {brand.nombre}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
