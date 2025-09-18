"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ShoppingBag, User, Menu, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
  is_active: boolean
}

interface Subcategory {
  id: number
  name: string
  slug: string
  category_id: number
  gender: string
  is_active: boolean
}

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<string[]>([])
  const [brandsWithProducts, setBrandsWithProducts] = useState<Brand[]>([])
  const [subcategoriesWithProducts, setSubcategoriesWithProducts] = useState<number[]>([])
  const [expandedMobileMenus, setExpandedMobileMenus] = useState<{ [key: string]: boolean }>({})
  const { state } = useCart()

  const toggleMobileMenu = (menuKey: string) => {
    setExpandedMobileMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }))
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        const { data: brandsData, error: brandsError } = await supabase
          .from("brands")
          .select("id, name, slug")
          .order("name")

        if (brandsError) {
          console.error("[v0] Error fetching brands:", brandsError)
        } else {
          console.log("[v0] Successfully loaded brands:", brandsData?.length || 0)
          setBrands(brandsData || [])

          const brandsWithProductsData: Brand[] = []
          for (const brand of brandsData || []) {
            const { data: productCount } = await supabase
              .from("products_in_stock")
              .select("id", { count: "exact" })
              .eq("brand", brand.name)
              .limit(1)

            if (productCount && productCount.length > 0) {
              brandsWithProductsData.push(brand)
            }
          }
          console.log("[v0] Brands with products:", brandsWithProductsData.length)
          setBrandsWithProducts(brandsWithProductsData)
        }

        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("sort_order")

        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from("subcategories")
          .select("*")
          .eq("is_active", true)
          .order("sort_order")

        if (categoriesError) {
          console.error("[v0] Error fetching categories:", categoriesError)
        } else {
          console.log("[v0] Successfully loaded categories:", categoriesData?.length || 0)
          setCategories(categoriesData || [])
        }

        if (subcategoriesError) {
          console.error("[v0] Error fetching subcategories:", subcategoriesError)
        } else {
          console.log("[v0] Successfully loaded subcategories:", subcategoriesData?.length || 0)
          setSubcategories(subcategoriesData || [])
        }

        const categoriesWithProductsData: string[] = []
        for (const category of categoriesData || []) {
          const { data: productCount } = await supabase.rpc("category_has_products", { cat_slug: category.slug })

          if (productCount) {
            categoriesWithProductsData.push(category.slug)
          }
        }

        console.log("[v0] Categories with products:", categoriesWithProductsData)
        setCategoriesWithProducts(categoriesWithProductsData)

        const subcategoriesWithProductsData: number[] = []
        for (const subcategory of subcategoriesData || []) {
          const { data: productCount } = await supabase
            .from("products_in_stock")
            .select("id", { count: "exact" })
            .eq("subcategory", subcategory.name)
            .limit(1)

          if (productCount && productCount.length > 0) {
            subcategoriesWithProductsData.push(subcategory.id)
          }
        }
        console.log("[v0] Subcategories with products:", subcategoriesWithProductsData.length)
        setSubcategoriesWithProducts(subcategoriesWithProductsData)
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  const getSubcategoriesForCategory = (categorySlug: string, gender?: string) => {
    const category = categories.find((cat) => cat.slug === categorySlug)
    if (!category || !categoriesWithProducts.includes(categorySlug)) {
      return []
    }

    let filteredSubcategories = subcategories.filter((subcat) => subcat.category_id === category.id)

    if (gender) {
      filteredSubcategories = filteredSubcategories.filter(
        (subcat) => subcat.gender === gender || subcat.gender === "unisex",
      )
    }

    // Esto permite que se muestren las subcategorías aunque no tengan productos actualmente
    return filteredSubcategories
  }

  const shouldShowCategory = (categorySlug: string) => {
    return categoriesWithProducts.includes(categorySlug)
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
              <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <nav className="flex flex-col space-y-1 mt-8 px-4">
                  <Collapsible open={expandedMobileMenus.mujer} onOpenChange={() => toggleMobileMenu("mujer")}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-lg font-medium hover:text-primary transition-colors py-4 border-b border-border">
                      MUJER
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${expandedMobileMenus.mujer ? "rotate-90" : ""}`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 ml-4 space-y-2 pb-4">
                      <Link href="/categoria/mujer" className="block text-sm hover:text-primary transition-colors py-2">
                        Ver todo
                      </Link>
                      {shouldShowCategory("vestimenta") && (
                        <div className="border-l-2 border-muted pl-4">
                          <Link
                            href="/categoria/mujer/vestimenta"
                            className="block text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2"
                          >
                            VESTIMENTA
                          </Link>
                          <div className="ml-4 space-y-1">
                            {getSubcategoriesForCategory("vestimenta", "mujer").map((subcat) => (
                              <Link
                                key={subcat.id}
                                href={`/categoria/mujer/vestimenta/${subcat.slug}`}
                                className="block text-xs hover:text-primary transition-colors py-1"
                              >
                                {subcat.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      {shouldShowCategory("accesorios") && (
                        <div className="border-l-2 border-muted pl-4">
                          <Link
                            href="/categoria/mujer/accesorios"
                            className="block text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2"
                          >
                            ACCESORIOS
                          </Link>
                          <div className="ml-4 space-y-1">
                            {getSubcategoriesForCategory("accesorios", "mujer").map((subcat) => (
                              <Link
                                key={subcat.id}
                                href={`/categoria/mujer/accesorios/${subcat.slug}`}
                                className="block text-xs hover:text-primary transition-colors py-1"
                              >
                                {subcat.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible open={expandedMobileMenus.hombre} onOpenChange={() => toggleMobileMenu("hombre")}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-lg font-medium hover:text-primary transition-colors py-4 border-b border-border">
                      HOMBRE
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${expandedMobileMenus.hombre ? "rotate-90" : ""}`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 ml-4 space-y-2 pb-4">
                      <Link
                        href="/categoria/hombre"
                        className="block text-sm hover:text-primary transition-colors py-2"
                      >
                        Ver todo
                      </Link>
                      {shouldShowCategory("vestimenta") && (
                        <div className="border-l-2 border-muted pl-4">
                          <Link
                            href="/categoria/hombre/vestimenta"
                            className="block text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2"
                          >
                            VESTIMENTA
                          </Link>
                          <div className="ml-4 space-y-1">
                            {getSubcategoriesForCategory("vestimenta", "hombre").map((subcat) => (
                              <Link
                                key={subcat.id}
                                href={`/categoria/hombre/vestimenta/${subcat.slug}`}
                                className="block text-xs hover:text-primary transition-colors py-1"
                              >
                                {subcat.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      {shouldShowCategory("accesorios") && (
                        <div className="border-l-2 border-muted pl-4">
                          <Link
                            href="/categoria/hombre/accesorios"
                            className="block text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2"
                          >
                            ACCESORIOS
                          </Link>
                          <div className="ml-4 space-y-1">
                            {getSubcategoriesForCategory("accesorios", "hombre").map((subcat) => (
                              <Link
                                key={subcat.id}
                                href={`/categoria/hombre/accesorios/${subcat.slug}`}
                                className="block text-xs hover:text-primary transition-colors py-1"
                              >
                                {subcat.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible open={expandedMobileMenus.marcas} onOpenChange={() => toggleMobileMenu("marcas")}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-lg font-medium hover:text-primary transition-colors py-4 border-b border-border">
                      MARCAS
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${expandedMobileMenus.marcas ? "rotate-90" : ""}`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 ml-4 pb-4">
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border-l-2 border-muted pl-4">
                        {brandsWithProducts.map((brand) => (
                          <Link
                            key={brand.id}
                            href={`/marca/${brand.slug}`}
                            className="text-sm hover:text-primary transition-colors p-2 hover:bg-muted rounded"
                          >
                            {brand.name}
                          </Link>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Link
                    href="/nuevo"
                    className="text-lg font-medium hover:text-primary transition-colors py-4 border-b border-border"
                  >
                    NUEVO
                  </Link>
                  <Link
                    href="/sale"
                    className="text-lg font-medium text-destructive hover:text-destructive/80 transition-colors py-4 border-b border-border"
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
          <nav className="hidden md:flex items-center justify-center space-x-8 flex-1">
            <div className="relative group">
              <Link
                href="/categoria/mujer"
                className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
              >
                MUJER
                <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
              </Link>

              <div className="absolute top-full left-0 mt-2 w-96 bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out z-[130]">
                <div className="p-6">
                  <div className="space-y-4">
                    {shouldShowCategory("vestimenta") && (
                      <div>
                        <Link
                          href="/categoria/mujer/vestimenta"
                          className="font-semibold text-sm mb-3 text-primary hover:text-primary/80 transition-colors block"
                        >
                          VESTIMENTA
                        </Link>
                        <div className="grid grid-cols-3 gap-x-4 gap-y-1 mt-3">
                          {getSubcategoriesForCategory("vestimenta", "mujer").map((subcat) => (
                            <Link
                              key={subcat.id}
                              href={`/categoria/mujer/vestimenta/${subcat.slug}`}
                              className="block text-xs hover:text-primary transition-colors py-1 truncate"
                            >
                              {subcat.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-8">
                      {shouldShowCategory("accesorios") && (
                        <div className="flex-1">
                          <Link
                            href="/categoria/mujer/accesorios"
                            className="font-semibold text-sm mb-3 text-primary hover:text-primary/80 transition-colors block"
                          >
                            ACCESORIOS
                          </Link>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
                            {getSubcategoriesForCategory("accesorios").map((subcat) => (
                              <Link
                                key={subcat.id}
                                href={`/categoria/mujer/accesorios/${subcat.slug}`}
                                className="block text-xs hover:text-primary transition-colors truncate"
                              >
                                {subcat.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {shouldShowCategory("calzado") && (
                        <div className="flex-1">
                          <Link
                            href="/categoria/mujer/calzado"
                            className="font-semibold text-sm text-primary hover:text-primary/80 transition-colors block"
                          >
                            CALZADO
                          </Link>
                        </div>
                      )}
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

              <div className="absolute top-full left-0 mt-2 w-96 bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out z-[130]">
                <div className="p-6">
                  <div className="space-y-4">
                    {shouldShowCategory("vestimenta") && (
                      <div>
                        <Link
                          href="/categoria/hombre/vestimenta"
                          className="font-semibold text-sm mb-3 text-primary hover:text-primary/80 transition-colors block"
                        >
                          VESTIMENTA
                        </Link>
                        <div className="grid grid-cols-3 gap-x-4 gap-y-1 mt-3">
                          {getSubcategoriesForCategory("vestimenta", "hombre").map((subcat) => (
                            <Link
                              key={subcat.id}
                              href={`/categoria/hombre/vestimenta/${subcat.slug}`}
                              className="block text-xs hover:text-primary transition-colors py-1 truncate"
                            >
                              {subcat.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-8">
                      {shouldShowCategory("accesorios") && (
                        <div className="flex-1">
                          <Link
                            href="/categoria/hombre/accesorios"
                            className="font-semibold text-sm mb-3 text-primary hover:text-primary/80 transition-colors block"
                          >
                            ACCESORIOS
                          </Link>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
                            {getSubcategoriesForCategory("accesorios").map((subcat) => (
                              <Link
                                key={subcat.id}
                                href={`/categoria/hombre/accesorios/${subcat.slug}`}
                                className="block text-xs hover:text-primary transition-colors truncate"
                              >
                                {subcat.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {shouldShowCategory("calzado") && (
                        <div className="flex-1">
                          <Link
                            href="/categoria/hombre/calzado"
                            className="font-semibold text-sm text-primary hover:text-primary/80 transition-colors block"
                          >
                            CALZADO
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <span className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 cursor-default">
                MARCAS
                <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
              </span>

              <div className="absolute top-full left-0 mt-2 w-64 bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out z-[130]">
                <div className="p-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {brandsWithProducts.map((brand) => (
                      <Link
                        key={brand.id}
                        href={`/marca/${brand.slug}`}
                        className="text-sm hover:text-primary transition-colors p-2 hover:bg-muted rounded"
                      >
                        {brand.name}
                      </Link>
                    ))}
                  </div>
                  {brandsWithProducts.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay marcas disponibles</p>
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
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <Link href="/cuenta">
                <User className="h-5 w-5" />
              </Link>
            </Button>

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
