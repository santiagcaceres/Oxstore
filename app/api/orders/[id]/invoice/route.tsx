import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateInvoiceHTML } from "@/lib/invoice-generator"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Generating invoice for order ID:", params.id)

    const supabase = createClient()

    console.log("[v0] Querying orders table for ID:", params.id)

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          product_name,
          quantity,
          price,
          total_price,
          total,
          size,
          color,
          product_image
        )
      `)
      .eq("id", params.id)
      .single()

    console.log("[v0] Query result - error:", error)
    console.log("[v0] Query result - order:", order ? "Found" : "Not found")

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: "Order not found", details: error.message }, { status: 404 })
    }

    if (!order) {
      console.error("[v0] Order not found for ID:", params.id)
      return NextResponse.json({ error: "Order not found", orderId: params.id }, { status: 404 })
    }

    console.log("[v0] Order data loaded:", order.order_number)
    console.log("[v0] Order items count:", order.order_items?.length || 0)

    const invoiceHTML = generateInvoiceHTML(order)

    console.log("[v0] Invoice HTML generated successfully")

    return new NextResponse(invoiceHTML, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="Factura-OXSTORE-${order.order_number}.html"`,
      },
    })
  } catch (error) {
    console.error("[v0] Exception in invoice generation:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
