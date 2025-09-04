"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ShoppingBag, User, Menu, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import { useCart } from "@/contexts/cart-context"
import { createBrowserClient } from "@supabase/ssr"

interface Brand {
  id: number
  name: string
  slug: string
}

interface Category {
  id: number
  name: string
  slug: string
  type: string
}

interface Subcategory {
  id: number
  name: string
  slug: string
  category_id: number
  parent_subcategory_id?: number
}

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const { state } = useCart()

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        const { data, error } = await supabase.from("brands").select("id, name, slug").order("name")

        if (error) {
          console.error("Error fetching brands:", error)
        } else {
          setBrands(data || [])
        }
      } catch (error) {
        console.error("Error fetching brands:", error)
      }
    }

    const fetchCategories = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .eq("type", "category")
          .order("name")

        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from("subcategories")
          .select("*")
          .order("name")

        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError)
        } else {
          setCategories(categoriesData || [])
        }

        if (subcategoriesError) {
          console.error("Error fetching subcategories:", subcategoriesError)
        } else {
          setSubcategories(subcategoriesData || [])
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchBrands()
    fetchCategories()
  }, [])

  const getSubcategoriesForCategory = (categorySlug: string) => {
    const category = categories.find((cat) => cat.slug === categorySlug)
    if (!category) return []

    return subcategories.filter((subcat) => subcat.category_id === category.id && !subcat.parent_subcategory_id)
  }

  const getSubSubcategories = (subcategoryId: number) => {
    return subcategories.filter((subcat) => subcat.parent_subcategory_id === subcategoryId)
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
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">MARCAS</h3>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {brands.map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/marca/${brand.slug}`}
                          className="text-sm hover:text-primary transition-colors p-2 hover:bg-muted rounded"
                        >
                          {brand.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <Link href="/nuevo" className="text-lg font-medium hover:text-primary transition-colors">
                    NUEVO
                  </Link>
                  <Link
                    href="/sale"
                    className="text-lg font-medium text-destructive hover:text-destructive/80 transition-colors"
                  >
                    SALE
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo-oxstore.png" alt="Oxstore" width={120} height={40} className="h-8 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <Link
                href="/categoria/mujer"
                className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
              >
                MUJER
                <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
              </Link>

              <div className="absolute top-full left-0 mt-2 w-80 bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out z-[130]">
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-sm mb-3 text-primary">VESTIMENTA</h3>
                      <div className="space-y-2">
                        {getSubcategoriesForCategory("vestimenta").map((subcat) => (
                          <div key={subcat.id}>
                            <Link
                              href={`/categoria/mujer/vestimenta/${subcat.slug}`}
                              className="block text-sm hover:text-primary transition-colors"
                            >
                              {subcat.name}
                            </Link>
                            {subcat.slug === "pantalones" && (
                              <div className="ml-3 mt-1 space-y-1">
                                {getSubSubcategories(subcat.id).map((subSubcat) => (
                                  <Link
                                    key={subSubcat.id}
                                    href={`/categoria/mujer/vestimenta/pantalones/${subSubcat.slug}`}
                                    className="block text-xs text-muted-foreground hover:text-primary transition-colors"
                                  >
                                    {subSubcat.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-3 text-primary">ACCESORIOS</h3>
                      <div className="space-y-2">
                        {getSubcategoriesForCategory("accesorios").map((subcat) => (
                          <Link
                            key={subcat.id}
                            href={`/categoria/mujer/accesorios/${subcat.slug}`}
                            className="block text-sm hover:text-primary transition-colors"
                          >
                            {subcat.name}
                          </Link>
                        ))}
                      </div>
                      <h3 className="font-semibold text-sm mb-3 mt-6 text-primary">CALZADO</h3>
                      <div className="space-y-2">
                        {getSubcategoriesForCategory("calzado").map((subcat) => (
                          <Link
                            key={subcat.id}
                            href={`/categoria/mujer/calzado/${subcat.slug}`}
                            className="block text-sm hover:text-primary transition-colors"
                          >
                            {subcat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <Link
                href="/categoria/hombre"
                className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
              >
                HOMBRE
                <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
              </Link>

              <div className="absolute top-full left-0 mt-2 w-80 bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out z-[130]">
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-sm mb-3 text-primary">VESTIMENTA</h3>
                      <div className="space-y-2">
                        {getSubcategoriesForCategory("vestimenta").map((subcat) => (
                          <div key={subcat.id}>
                            <Link
                              href={`/categoria/hombre/vestimenta/${subcat.slug}`}
                              className="block text-sm hover:text-primary transition-colors"
                            >
                              {subcat.name}
                            </Link>
                            {subcat.slug === "pantalones" && (
                              <div className="ml-3 mt-1 space-y-1">
                                {getSubSubcategories(subcat.id).map((subSubcat) => (
                                  <Link
                                    key={subSubcat.id}
                                    href={`/categoria/hombre/vestimenta/pantalones/${subSubcat.slug}`}
                                    className="block text-xs text-muted-foreground hover:text-primary transition-colors"
                                  >
                                    {subSubcat.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-3 text-primary">ACCESORIOS</h3>
                      <div className="space-y-2">
                        {getSubcategoriesForCategory("accesorios").map((subcat) => (
                          <Link
                            key={subcat.id}
                            href={`/categoria/hombre/accesorios/${subcat.slug}`}
                            className="block text-sm hover:text-primary transition-colors"
                          >
                            {subcat.name}
                          </Link>
                        ))}
                      </div>
                      <h3 className="font-semibold text-sm mb-3 mt-6 text-primary">CALZADO</h3>
                      <div className="space-y-2">
                        {getSubcategoriesForCategory("calzado").map((subcat) => (
                          <Link
                            key={subcat.id}
                            href={`/categoria/hombre/calzado/${subcat.slug}`}
                            className="block text-sm hover:text-primary transition-colors"
                          >
                            {subcat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <Link
                href="/marcas"
                className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
              >
                MARCAS
                <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
              </Link>

              <div className="absolute top-full left-0 mt-2 w-64 bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out z-[130]">
                <div className="p-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {brands.map((brand) => (
                      <Link
                        key={brand.id}
                        href={`/marca/${brand.slug}`}
                        className="text-sm hover:text-primary transition-colors p-2 hover:bg-muted rounded"
                      >
                        {brand.name}
                      </Link>
                    ))}
                  </div>
                  {brands.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Cargando marcas...</p>
                  )}
                </div>
              </div>
            </div>

            <Link href="/nuevo" className="text-sm font-medium hover:text-primary transition-colors">
              NUEVO
            </Link>

            <Link
              href="/sale"
              className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
            >
              SALE
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center ml-auto">
            <div className="relative w-80">
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
