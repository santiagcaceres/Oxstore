"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Don't show header/footer on admin pages
  const isAdminPage = pathname.startsWith("/admin")

  // Only show header on home page
  const showHeader = pathname === "/" && !isAdminPage

  // Show footer on all pages except admin
  const showFooter = !isAdminPage

  return (
    <>
      {showHeader && <Header />}
      <main className={showHeader ? "" : "pt-0"}>{children}</main>
      {showFooter && <Footer />}
    </>
  )
}
