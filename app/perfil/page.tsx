"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PerfilPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/cuenta")
  }, [router])

  return null
}
