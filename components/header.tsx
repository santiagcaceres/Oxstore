"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/context/cart-context"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { state } = useCart()

  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0)

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
                src={isScrolled ? "/logo-oscuro.png" : "/logo-claro.png"}
                alt="OX Store"
                width={120}
                height={48}
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/hombre" className="text-black hover:text-gray-600 font-medium">
              Hombre
            </Link>
            <Link href="/mujer" className="text-black hover:text-gray-600 font-medium">
              Mujer
            </Link>
            <Link href="/vestimenta" className="text-black hover:text-gray-600 font-medium">
              Vestimenta
            </Link>
            <Link href="/accesorios" className="text-black hover:text-gray-600 font-medium">
              Accesorios
            </Link>
            <Link href="/sale" className="text-black hover:text-gray-600 font-medium">
              Sale
            </Link>
            <Link href="/nuevo" className="text-black hover:text-gray-600 font-medium">
              Nuevo
            </Link>
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
                <Link
                  href="/hombre"
                  className="text-black hover:text-gray-600 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Hombre
                </Link>
                <Link
                  href="/mujer"
                  className="text-black hover:text-gray-600 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Mujer
                </Link>
                <Link
                  href="/vestimenta"
                  className="text-black hover:text-gray-600 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Vestimenta
                </Link>
                <Link
                  href="/accesorios"
                  className="text-black hover:text-gray-600 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Accesorios
                </Link>
                <Link
                  href="/sale"
                  className="text-black hover:text-gray-600 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sale
                </Link>
                <Link
                  href="/nuevo"
                  className="text-black hover:text-gray-600 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Nuevo
                </Link>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
