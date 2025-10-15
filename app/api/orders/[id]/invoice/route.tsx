import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateInvoiceHTML } from "@/lib/invoice-generator"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Generating invoice for order ID:", params.id)

    const supabase = createClient()

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          product_name,
          quantity,
          unit_price,
          price,
          total_price,
          total,
          size,
          color
        )
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching order:", error)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (!order) {
      console.error("Order not found for ID:", params.id)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
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
    console.error("Error generating invoice:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
