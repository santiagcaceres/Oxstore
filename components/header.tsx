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

interface Category {
  id: number
  nombre: string
  slug: string
  subcategorias: {
    id: number
    nombre: string
    slug: string
  }[]
}

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isBrandsOpen, setIsBrandsOpen] = useState(false)
  const [isMujerOpen, setIsMujerOpen] = useState(false)
  const [isHombreOpen, setIsHombreOpen] = useState(false)
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

    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/zureo/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchBrands()
    fetchCategories()
  }, [])

  const getSubcategoriesForGender = (gender: "mujer" | "hombre") => {
    const vestimenta = categories.find((cat) => cat.slug === "vestimenta")
    const calzado = categories.find((cat) => cat.slug === "calzado")
    const accesorios = categories.find((cat) => cat.slug === "accesorios")

    return {
      vestimenta: vestimenta?.subcategorias || [],
      calzado: calzado?.subcategorias || [],
      accesorios: accesorios?.subcategorias || [],
    }
  }

  return (
    <header className="sticky top-0 z-[100] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  <Link href="/categoria/mujer" className="text-lg font-medium hover:text-primary transition-colors">
                    MUJER
                  </Link>
                  <Link href="/categoria/hombre" className="text-lg font-medium hover:text-primary transition-colors">
                    HOMBRE
                  </Link>
                  <Link href="/nuevo" className="text-lg font-medium hover:text-primary transition-colors">
                    NUEVO
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

            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo-oxstore.png" alt="Oxstore" width={120} height={40} className="h-8 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <div
              className="relative"
              onMouseEnter={() => setIsMujerOpen(true)}
              onMouseLeave={() => setIsMujerOpen(false)}
            >
              <Link
                href="/categoria/mujer"
                className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
              >
                MUJER
                <ChevronDown className="h-3 w-3" />
              </Link>

              {isMujerOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-background border rounded-lg shadow-lg animate-fade-in-up z-[110]">
                  <div className="p-6">
                    {(() => {
                      const subcats = getSubcategoriesForGender("mujer")
                      return (
                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <h3 className="font-semibold text-sm mb-3 text-primary">VESTIMENTA</h3>
                            <div className="space-y-2">
                              {subcats.vestimenta.map((subcat) => (
                                <Link
                                  key={subcat.id}
                                  href={`/categoria/mujer/${subcat.slug}`}
                                  className="block text-sm hover:text-primary transition-colors"
                                >
                                  {subcat.nombre}
                                </Link>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm mb-3 text-primary">CALZADO</h3>
                            <div className="space-y-2">
                              {subcats.calzado.map((subcat) => (
                                <Link
                                  key={subcat.id}
                                  href={`/categoria/mujer/${subcat.slug}`}
                                  className="block text-sm hover:text-primary transition-colors"
                                >
                                  {subcat.nombre}
                                </Link>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm mb-3 text-primary">ACCESORIOS</h3>
                            <div className="space-y-2">
                              {subcats.accesorios.map((subcat) => (
                                <Link
                                  key={subcat.id}
                                  href={`/categoria/mujer/${subcat.slug}`}
                                  className="block text-sm hover:text-primary transition-colors"
                                >
                                  {subcat.nombre}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setIsHombreOpen(true)}
              onMouseLeave={() => setIsHombreOpen(false)}
            >
              <Link
                href="/categoria/hombre"
                className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
              >
                HOMBRE
                <ChevronDown className="h-3 w-3" />
              </Link>

              {isHombreOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-background border rounded-lg shadow-lg animate-fade-in-up z-[110]">
                  <div className="p-6">
                    {(() => {
                      const subcats = getSubcategoriesForGender("hombre")
                      return (
                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <h3 className="font-semibold text-sm mb-3 text-primary">VESTIMENTA</h3>
                            <div className="space-y-2">
                              {subcats.vestimenta.map((subcat) => (
                                <Link
                                  key={subcat.id}
                                  href={`/categoria/hombre/${subcat.slug}`}
                                  className="block text-sm hover:text-primary transition-colors"
                                >
                                  {subcat.nombre}
                                </Link>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm mb-3 text-primary">CALZADO</h3>
                            <div className="space-y-2">
                              {subcats.calzado.map((subcat) => (
                                <Link
                                  key={subcat.id}
                                  href={`/categoria/hombre/${subcat.slug}`}
                                  className="block text-sm hover:text-primary transition-colors"
                                >
                                  {subcat.nombre}
                                </Link>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm mb-3 text-primary">ACCESORIOS</h3>
                            <div className="space-y-2">
                              {subcats.accesorios.map((subcat) => (
                                <Link
                                  key={subcat.id}
                                  href={`/categoria/hombre/${subcat.slug}`}
                                  className="block text-sm hover:text-primary transition-colors"
                                >
                                  {subcat.nombre}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              )}
            </div>

            <Link href="/nuevo" className="text-sm font-medium hover:text-primary transition-colors">
              NUEVO
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
                <div className="absolute top-full left-0 mt-2 w-64 bg-background border rounded-lg shadow-lg animate-fade-in-up z-[110]">
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
