"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (query) {
      // Implement search logic here
      setLoading(false)
    }
  }, [query])

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Buscando...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Resultados para: "{query}"</h1>
      {products.length === 0 ? (
        <p>No se encontraron productos.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Render products */}
        </div>
      )}
    </div>
  )
}
