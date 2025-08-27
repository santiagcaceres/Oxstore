"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ShoppingBag, User, Menu, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import { useCart } from "@/contexts/cart-context"

interface Brand {
  id: number
  nombre: string
  slug: string
}

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const [isBrandsOpen, setIsBrandsOpen] = useState(false)
  const { state } = useCart()

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo-oxstore.png" alt="Oxstore" width={120} height={40} className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/categoria/mujer" className="text-sm font-medium hover:text-primary transition-colors">
              MUJER
            </Link>
            <Link href="/categoria/hombre" className="text-sm font-medium hover:text-primary transition-colors">
              HOMBRE
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setIsBrandsOpen(true)}
              onMouseLeave={() => setIsBrandsOpen(false)}
            >
              <button className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                MARCAS
                <ChevronDown className="h-3 w-3" />
              </button>

              {isBrandsOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-background border rounded-lg shadow-lg animate-fade-in-up z-50">
                  <div className="p-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2">
                      {brands.map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/marca/${brand.slug}`}
                          className="text-sm hover:text-primary transition-colors p-2 hover:bg-muted rounded"
                        >
                          {brand.nombre}
                        </Link>
                      ))}
                    </div>
                    {brands.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Cargando marcas...</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Link
              href="/ofertas"
              className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
            >
              OFERTAS
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-sm mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input type="search" placeholder="Buscar productos..." className="pl-10 pr-4" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search */}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className="h-5 w-5" />
            </Button>

            {/* User Account */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cuenta">
                <User className="h-5 w-5" />
              </Link>
            </Button>

            {/* Shopping Cart */}
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/carrito">
                <ShoppingBag className="h-5 w-5" />
                {state.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {state.itemCount}
                  </span>
                )}
              </Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  <Link href="/categoria/mujer" className="text-lg font-medium hover:text-primary transition-colors">
                    MUJER
                  </Link>
                  <Link href="/categoria/hombre" className="text-lg font-medium hover:text-primary transition-colors">
                    HOMBRE
                  </Link>
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">MARCAS</h3>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {brands.map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/marca/${brand.slug}`}
                          className="text-sm hover:text-primary transition-colors p-2 hover:bg-muted rounded"
                        >
                          {brand.nombre}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <Link
                    href="/ofertas"
                    className="text-lg font-medium text-destructive hover:text-destructive/80 transition-colors"
                  >
                    OFERTAS
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="lg:hidden py-4 border-t animate-fade-in-up">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input type="search" placeholder="Buscar productos..." className="pl-10 pr-4" />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
