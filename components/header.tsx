"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ShoppingCart, Menu, X, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { state } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMenuOpen])

  const menCategories = [
    { name: "Remeras", href: "/hombre/remeras" },
    { name: "Buzos", href: "/hombre/buzos" },
    { name: "Pantalones", href: "/hombre/pantalones" },
    { name: "Camperas", href: "/hombre/camperas" },
    { name: "Calzado", href: "/hombre/calzado" },
  ]

  const womenCategories = [
    { name: "Remeras", href: "/mujer/remeras" },
    { name: "Buzos", href: "/mujer/buzos" },
    { name: "Pantalones", href: "/mujer/pantalones" },
    { name: "Vestidos", href: "/vestimenta/vestidos" },
    { name: "Faldas", href: "/vestimenta/faldas" },
    { name: "Calzado", href: "/mujer/calzado" },
  ]

  const headerClass = isScrolled ? "bg-blue-950 text-white shadow-lg" : "bg-white text-gray-800 shadow-sm border-b"

  const buttonClass = isScrolled ? "text-white hover:bg-blue-900" : "text-gray-700 hover:bg-gray-100"

  const logoClass = isScrolled ? "text-white" : "text-blue-950"

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${headerClass}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className={`text-2xl font-bold transition-colors ${logoClass}`}>
            OXSTORE
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Hombre con dropdown */}
            <div className="relative group">
              <Link
                href="/hombre"
                className={`flex items-center gap-1 transition-colors hover:opacity-80 ${
                  isScrolled ? "text-white" : "text-gray-700"
                }`}
              >
                HOMBRE
                <ChevronDown className="h-4 w-4" />
              </Link>
              <div className="absolute top-full left-0 bg-white shadow-lg rounded-lg py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {menCategories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-950 transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mujer con dropdown */}
            <div className="relative group">
              <Link
                href="/mujer"
                className={`flex items-center gap-1 transition-colors hover:opacity-80 ${
                  isScrolled ? "text-white" : "text-gray-700"
                }`}
              >
                MUJER
                <ChevronDown className="h-4 w-4" />
              </Link>
              <div className="absolute top-full left-0 bg-white shadow-lg rounded-lg py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {womenCategories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-950 transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/accesorios"
              className={`transition-colors hover:opacity-80 ${isScrolled ? "text-white" : "text-gray-700"}`}
            >
              ACCESORIOS
            </Link>
            <Link
              href="/sale"
              className={`font-semibold transition-colors hover:opacity-80 ${
                isScrolled ? "text-red-300" : "text-red-600"
              }`}
            >
              SALE
            </Link>
            <Link
              href="/nuevo"
              className={`transition-colors hover:opacity-80 ${isScrolled ? "text-white" : "text-gray-700"}`}
            >
              NUEVO
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(!isSearchOpen)} className={buttonClass}>
              <Search className="h-5 w-5" />
            </Button>

            <Link href="/perfil">
              <Button variant="ghost" size="sm" className={buttonClass}>
                <User className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/carrito" className="relative">
              <Button variant="ghost" size="sm" className={buttonClass}>
                <ShoppingCart className="h-5 w-5" />
                {state.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {state.itemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`lg:hidden ${buttonClass}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent text-gray-900"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white z-50 overflow-y-auto">
          <div className="px-4 py-6 space-y-6">
            {/* Mobile Navigation */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">HOMBRE</h3>
                <div className="pl-4 space-y-2">
                  {menCategories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="block text-gray-600 hover:text-blue-950 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">MUJER</h3>
                <div className="pl-4 space-y-2">
                  {womenCategories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="block text-gray-600 hover:text-blue-950 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/accesorios"
                className="block font-semibold text-gray-900 hover:text-blue-950 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                ACCESORIOS
              </Link>
              <Link
                href="/sale"
                className="block font-semibold text-red-600 hover:text-red-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                SALE
              </Link>
              <Link
                href="/nuevo"
                className="block font-semibold text-gray-900 hover:text-blue-950 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                NUEVO
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="border-t pt-6 space-y-4">
              <Link
                href="/perfil"
                className="flex items-center gap-3 text-gray-700 hover:text-blue-950 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                Mi Perfil
              </Link>
              <Link
                href="/carrito"
                className="flex items-center gap-3 text-gray-700 hover:text-blue-950 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="h-5 w-5" />
                Carrito ({state.itemCount})
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
