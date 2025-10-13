"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Search, ShoppingBag, User, Menu, ChevronDown, ChevronRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Image from "next/image"
import { useCart } from "@/contexts/cart-context"
import { createBrowserClient } from "@supabase/ssr"
import { usePathname } from "next/navigation"

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
  const pathname = usePathname()
  const { state } = useCart()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<string[]>([])
  const [brandsWithProducts, setBrandsWithProducts] = useState<Brand[]>([])
  const [subcategoriesWithProducts, setSubcategoriesWithProducts] = useState<number[]>([])
  const [expandedMobileMenus, setExpandedMobileMenus] = useState<{ [key: string]: boolean }>({})

  const isAdminRoute = pathname?.startsWith("/admin")
  const isHomePage = pathname === "/"

  const toggleMobileMenu = (menuKey: string) => {
    setExpandedMobileMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }))
  }

  useEffect(() => {
    if (isAdminRoute) return

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
  }, [isAdminRoute])

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

    return filteredSubcategories
  }

  const shouldShowCategory = (categorySlug: string) => {
    return categoriesWithProducts.includes(categorySlug)
  }

  const searchProducts = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const searchTerm = query.toLowerCase()
      const { data, error } = await supabase
        .from("products_in_stock")
        .select("id, name, brand, price, image_url, zureo_code")
        .or(
          `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,zureo_code.ilike.%${searchTerm}%`,
        )
        .gt("stock_quantity", 0)
        .eq("is_active", true)
        .limit(5)

      if (!error && data) {
        const uniqueProducts = data.reduce((acc: any[], product) => {
          if (!acc.find((p) => p.zureo_code === product.zureo_code)) {
            acc.push(product)
          }
          return acc
        }, [])

        setSearchSuggestions(uniqueProducts)
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error("[v0] Error searching products:", error)
    }
  }

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchProducts(searchQuery)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSuggestions(false)
      window.location.href = `/buscar?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const handleSuggestionClick = (productId: number, productName: string) => {
    setShowSuggestions(false)
    setSearchQuery("")
    const slug = `${productId}-${productName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim()}`
    window.location.href = `/producto/${slug}`
  }

  return (
    <header
      className={`sticky top-0 z-[100] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-[300px] sm:translate-x-[400px]" : "translate-x-0"} md:translate-x-0`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {!isHomePage && (
              <Button variant="ghost" size="icon" asChild className="hidden md:flex">
                <Link href="/">
                  <Home className="h-5 w-5" />
                </Link>
              </Button>
            )}

            <Sheet onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                {!isHomePage && (
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors py-6 px-2 border-b border-border/50 rounded hover:bg-muted/30 mt-8"
                  >
                    <Home className="h-5 w-5" />
                    INICIO
                  </Link>
                )}
                <nav className="flex flex-col space-y-0">
                  <Collapsible open={expandedMobileMenus.mujer} onOpenChange={() => toggleMobileMenu("mujer")}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-lg font-medium hover:text-primary transition-colors py-6 border-b border-border/50">
                      MUJER
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${expandedMobileMenus.mujer ? "rotate-90" : ""}`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3 ml-4 space-y-3 pb-6">
                      <Link
                        href="/categoria/mujer"
                        className="block text-sm hover:text-primary transition-colors py-2 px-2 rounded hover:bg-muted/50"
                      >
                        Ver todo
                      </Link>
                      {shouldShowCategory("vestimenta") && (
                        <div className="border-l-2 border-muted pl-4 space-y-2">
                          <Link
                            href="/categoria/mujer/vestimenta"
                            className="block text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2 px-2 rounded hover:bg-primary/5"
                          >
                            VESTIMENTA
                          </Link>
                          <div className="ml-4 space-y-2">
                            {getSubcategoriesForCategory("vestimenta", "mujer").map((subcat) => (
                              <Link
                                key={subcat.id}
                                href={`/categoria/mujer/vestimenta/${subcat.slug}`}
                                className="block text-xs hover:text-primary transition-colors py-2 px-2 rounded hover:bg-muted/30"
                              >
                                {subcat.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      {shouldShowCategory("accesorios") && (
                        <div className="border-l-2 border-muted pl-4 space-y-2">
                          <Link
                            href="/categoria/mujer/accesorios"
                            className="block text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2 px-2 rounded hover:bg-primary/5"
                          >
                            ACCESORIOS
                          </Link>
                          <div className="ml-4 space-y-2">
                            {getSubcategoriesForCategory("accesorios", "mujer").map((subcat) => (
                              <Link
                                key={subcat.id}
                                href={`/categoria/mujer/accesorios/${subcat.slug}`}
                                className="block text-xs hover:text-primary transition-colors py-2 px-2 rounded hover:bg-muted/30"
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
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-lg font-medium hover:text-primary transition-colors py-6 border-b border-border/50">
                      HOMBRE
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${expandedMobileMenus.hombre ? "rotate-90" : ""}`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3 ml-4 space-y-3 pb-6">
                      <Link
                        href="/categoria/hombre"
                        className="block text-sm hover:text-primary transition-colors py-2 px-2 rounded hover:bg-muted/50"
                      >
                        Ver todo
                      </Link>
                      {shouldShowCategory("vestimenta") && (
                        <div className="border-l-2 border-muted pl-4 space-y-2">
                          <Link
                            href="/categoria/hombre/vestimenta"
                            className="block text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2 px-2 rounded hover:bg-primary/5"
                          >
                            VESTIMENTA
                          </Link>
                          <div className="ml-4 space-y-2">
                            {getSubcategoriesForCategory("vestimenta", "hombre").map((subcat) => (
                              <Link
                                key={subcat.id}
                                href={`/categoria/hombre/vestimenta/${subcat.slug}`}
                                className="block text-xs hover:text-primary transition-colors py-2 px-2 rounded hover:bg-muted/30"
                              >
                                {subcat.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      {shouldShowCategory("accesorios") && (
                        <div className="border-l-2 border-muted pl-4 space-y-2">
                          <Link
                            href="/categoria/hombre/accesorios"
                            className="block text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2 px-2 rounded hover:bg-primary/5"
                          >
                            ACCESORIOS
                          </Link>
                          <div className="ml-4 space-y-2">
                            {getSubcategoriesForCategory("accesorios", "hombre").map((subcat) => (
                              <Link
                                key={subcat.id}
                                href={`/categoria/hombre/accesorios/${subcat.slug}`}
                                className="block text-xs hover:text-primary transition-colors py-2 px-2 rounded hover:bg-muted/30"
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
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-lg font-medium hover:text-primary transition-colors py-6 border-b border-border/50">
                      MARCAS
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${expandedMobileMenus.marcas ? "rotate-90" : ""}`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3 ml-4 pb-6">
                      <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border-l-2 border-muted pl-4">
                        {brandsWithProducts.map((brand) => (
                          <Link
                            key={brand.id}
                            href={`/marca/${brand.slug}`}
                            className="text-sm hover:text-primary transition-colors p-3 hover:bg-muted/50 rounded"
                          >
                            {brand.name}
                          </Link>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Link
                    href="/nuevo"
                    className="text-lg font-medium hover:text-primary transition-colors py-6 px-2 border-b border-border/50 rounded hover:bg-muted/30"
                  >
                    NUEVO
                  </Link>
                  <Link
                    href="/sale"
                    className="text-lg font-medium text-destructive hover:text-destructive/80 transition-colors py-6 px-2 border-b border-border/50 rounded hover:bg-destructive/5"
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
                            {getSubcategoriesForCategory("accesorios", "mujer").map((subcat) => (
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
                            {getSubcategoriesForCategory("accesorios", "hombre").map((subcat) => (
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
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                <Input
                  type="search"
                  placeholder="Buscar productos..."
                  className="pl-10 pr-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
              </form>

              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-[150] max-h-96 overflow-y-auto">
                  {searchSuggestions.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSuggestionClick(product.id, product.name)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left border-b last:border-b-0"
                    >
                      <img
                        src={product.image_url || "/placeholder.svg?height=50&width=50"}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      </div>
                      <p className="text-sm font-semibold">${product.price?.toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              )}
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
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                <Input
                  type="search"
                  placeholder="Buscar productos..."
                  className="pl-10 pr-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
              </form>

              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-[150] max-h-96 overflow-y-auto">
                  {searchSuggestions.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSuggestionClick(product.id, product.name)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left border-b last:border-b-0"
                    >
                      <img
                        src={product.image_url || "/placeholder.svg?height=50&width=50"}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      </div>
                      <p className="text-sm font-semibold">${product.price?.toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
