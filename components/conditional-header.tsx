"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/header"

export function ConditionalHeader() {
  const pathname = usePathname()

  const isAdminRoute = pathname?.startsWith("/admin")
  const isAuthRoute = pathname?.startsWith("/auth")

  if (isAdminRoute || isAuthRoute) {
    return null
  }

  return <Header />
}
