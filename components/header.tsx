"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, Menu, X, User } from "lucide-react"
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
            <div className="relative h-10 w-24 md:h-12 md:w-32">
              <Image
                src={isScrolled ? "/logo-oscuro.png" : "/logo-oscuro.png"}
                alt="OXSTORE"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/nuevo" className="text-black hover:text-gray-600 font-medium">
              Nuevo
            </Link>
            <Link href="/hombre" className="text-black hover:text-gray-600 font-medium">
              Hombre
            </Link>
            <Link href="/mujer" className="text-black hover:text-gray-600 font-medium">
              Mujer
            </Link>
            <Link href="/accesorios" className="text-black hover:text-gray-600 font-medium">
              Accesorios
            </Link>
            <Link href="/sale" className="text-black hover:text-gray-600 font-medium">
              Sale
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </form>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            <Link href="/perfil">
              <Button variant="ghost" size="sm" className="text-black hover:text-gray-600">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/carrito" className="relative">
              <Button variant="ghost" size="sm" className="text-black hover:text-gray-600">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-black"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-full"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </form>

              {/* Mobile Navigation */}
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/nuevo"
                  className="text-black hover:text-gray-600 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Nuevo
                </Link>
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
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
