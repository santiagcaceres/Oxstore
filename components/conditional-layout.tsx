"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // No mostrar header/footer en rutas de admin
  const isAdminRoute = pathname.startsWith("/admin")

  // Solo mostrar header en la página principal
  const showHeader = pathname === "/"

  return (
    <>
      {showHeader && !isAdminRoute && <Header />}
      <main className={showHeader && !isAdminRoute ? "" : "pt-0"}>{children}</main>
      {!isAdminRoute && <Footer />}
    </>
  )
}
