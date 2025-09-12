"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, AlertCircle } from "lucide-react"

interface Variant {
  id: number
  color: string
  size: string
  stock_quantity: number
  price: number
}

interface VariantsDisplayProps {
  zureoCode: string
}

function VariantsDisplay({ zureoCode }: VariantsDisplayProps) {
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadVariants()
  }, [zureoCode])

  const loadVariants = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[v0] Loading variants for zureo_code:", zureoCode)

      const response = await fetch(`/api/products/variants?zureo_code=${zureoCode}`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] Variants loaded:", data)

      setVariants(data || [])
    } catch (error) {
      console.error("[v0] Error loading variants:", error)
      setError(error instanceof Error ? error.message : "Error al cargar variantes")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Cargando variantes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (variants.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No se encontraron variantes para este producto.</AlertDescription>
      </Alert>
    )
  }

  const uniqueSizes = [...new Set(variants.map((v) => v.size).filter(Boolean))]
  const uniqueColors = [...new Set(variants.map((v) => v.color).filter(Boolean))]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Talles Disponibles</h4>
          <div className="flex flex-wrap gap-2">
            {uniqueSizes.length > 0 ? (
              uniqueSizes.map((size) => (
                <Badge key={size} variant="outline">
                  {size.toUpperCase()}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Sin talles específicos</span>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Colores Disponibles</h4>
          <div className="flex flex-wrap gap-2">
            {uniqueColors.length > 0 ? (
              uniqueColors.map((color) => (
                <Badge key={color} variant="outline">
                  {color.toUpperCase()}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Sin colores específicos</span>
            )}
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Todas las Variantes</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Talle</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Precio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell className="font-mono text-sm">{variant.id}</TableCell>
                <TableCell>
                  {variant.size ? (
                    <Badge variant="outline">{variant.size.toUpperCase()}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {variant.color ? (
                    <Badge variant="outline">{variant.color.toUpperCase()}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={variant.stock_quantity > 5 ? "default" : "secondary"}
                    className={variant.stock_quantity > 5 ? "bg-green-100 text-green-800" : ""}
                  >
                    {variant.stock_quantity} unidades
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">${variant.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default VariantsDisplay
