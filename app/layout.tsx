import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/contexts/cart-context"
import { FloatingCart } from "@/components/floating-cart"

export const metadata: Metadata = {
  title: "Oxstore - Tu tienda de confianza",
  description: "Descubre los mejores productos en Oxstore. Calidad, estilo y las mejores marcas.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <CartProvider>
            {children}
            <FloatingCart />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
