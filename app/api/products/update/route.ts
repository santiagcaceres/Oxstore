import { NextResponse } from "next/server"
import { createOrUpdateProduct } from "@/lib/product-manager"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { productCode, ...data } = await request.json()

    if (!productCode) {
      return NextResponse.json(
        {
          success: false,
          error: "Product code is required",
        },
        { status: 400 },
      )
    }

    const result = await createOrUpdateProduct(productCode, data)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Product updated successfully",
        data: result.data,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update product",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error updating product",
      },
      { status: 500 },
    )
  }
}
