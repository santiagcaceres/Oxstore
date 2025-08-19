import { NextResponse } from "next/server"
import { getZureoProducts } from "@/lib/zureo-api"

export async function GET() {
  try {
    const response = await getZureoProducts({ qty: 5000, includeInactive: false })

    if (!response.success || !Array.isArray(response.data)) {
      return NextResponse.json({
        success: false,
        error: "No se pudieron obtener los productos",
      })
    }

    const productsWithStock = response.data
      .filter((product: any) => product.stock > 0)
      .map((product: any) => ({
        id: product.id,
        codigo: product.codigo,
        nombre: product.nombre,
        stock: product.stock,
        precio: product.precio,
        marca: {
          id: product.marca?.id || 0,
          nombre: product.marca?.nombre || null,
        },
        tipo: product.tipo || { id: 0, nombre: "Sin tipo" },
        variedades: product.variedades || [],
        fechaAlta: product.fecha_alta,
        fechaModificado: product.fecha_modificado,
        descripcionCorta: product.descripcion_corta,
        descripcionLarga: product.descripcion_larga,
        impuesto: product.impuesto,
        unidadMedida: product.unidad_de_medida,
      }))

    return NextResponse.json({
      success: true,
      data: productsWithStock,
      message: `Productos con stock > 0: ${productsWithStock.length} de ${response.data.length} productos`,
      totalProducts: response.data.length,
      productsWithStock: productsWithStock.length,
      totalStockValue: productsWithStock.reduce((sum: number, p: any) => sum + p.stock * p.precio, 0),
    })
  } catch (error) {
    console.error("Error filtering products with stock:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
