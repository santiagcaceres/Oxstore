"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, Menu, X, User } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
        isScrolled ? "bg-white shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="relative h-12 w-32 md:h-14 md:w-40">
              <Image
                src={isScrolled ? "/logo-oscuro.png" : "/logo-claro.png"}
                alt="OX Store"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/nuevo" className="text-sm font-medium hover:text-gray-600 transition-colors">
              Nuevo
            </Link>
            <Link href="/hombre" className="text-sm font-medium hover:text-gray-600 transition-colors">
              Hombre
            </Link>
            <Link href="/mujer" className="text-sm font-medium hover:text-gray-600 transition-colors">
              Mujer
            </Link>
            <Link href="/vestimenta" className="text-sm font-medium hover:text-gray-600 transition-colors">
              Vestimenta
            </Link>
            <Link href="/accesorios" className="text-sm font-medium hover:text-gray-600 transition-colors">
              Accesorios
            </Link>
            <Link href="/sale" className="text-sm font-medium text-black hover:text-gray-600 transition-colors">
              Sale
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
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
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black hover:bg-gray-800"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/perfil">Mi Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin">Admin</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            <Link href="/carrito">
              <Button variant="ghost" size="sm" className="relative p-2">
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
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
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
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black hover:bg-gray-800"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                <Link
                  href="/nuevo"
                  className="block py-2 text-sm font-medium hover:text-gray-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Nuevo
                </Link>
                <Link
                  href="/hombre"
                  className="block py-2 text-sm font-medium hover:text-gray-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Hombre
                </Link>
                <Link
                  href="/mujer"
                  className="block py-2 text-sm font-medium hover:text-gray-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Mujer
                </Link>
                <Link
                  href="/vestimenta"
                  className="block py-2 text-sm font-medium hover:text-gray-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Vestimenta
                </Link>
                <Link
                  href="/accesorios"
                  className="block py-2 text-sm font-medium hover:text-gray-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Accesorios
                </Link>
                <Link
                  href="/sale"
                  className="block py-2 text-sm font-medium text-black hover:text-gray-600"
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
