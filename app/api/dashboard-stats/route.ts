import { NextResponse } from "next/server"
import { zureoAPI } from "@/lib/api"

export async function GET() {
  try {
    const [products, rubros] = await Promise.all([zureoAPI.getAllProducts(), zureoAPI.getRubros()])

    const lowStockProducts = products.filter((p) => p.stock <= 5).length
    const totalValue = products.reduce((sum, p) => sum + p.precio * p.stock, 0)

    return NextResponse.json({
      totalProducts: products.length,
      totalCategories: rubros.length,
      lowStockProducts,
      totalValue,
      lastSync: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({
      totalProducts: 0,
      totalCategories: 0,
      lowStockProducts: 0,
      totalValue: 0,
      lastSync: null,
    })
  }
}
