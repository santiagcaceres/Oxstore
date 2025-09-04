import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          product_name,
          quantity,
          unit_price,
          total_price,
          size,
          color
        )
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Generate HTML invoice
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Factura ${order.order_number}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .invoice-title {
            font-size: 20px;
            color: #666;
          }
          .order-info { 
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px; 
          }
          .info-section h3 {
            margin-top: 0;
            color: #000;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
          }
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px; 
          }
          .items-table th, .items-table td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
          }
          .items-table th { 
            background-color: #f8f9fa; 
            font-weight: bold;
          }
          .items-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .total-section {
            text-align: right;
            margin-top: 20px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid #eee;
          }
          .total-final {
            font-size: 18px;
            font-weight: bold;
            border-top: 2px solid #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">OXSTORE</div>
          <div class="invoice-title">FACTURA</div>
        </div>
        
        <div class="order-info">
          <div class="info-section">
            <h3>Información del Pedido</h3>
            <p><strong>Número de Orden:</strong> ${order.order_number}</p>
            <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleDateString("es-ES")}</p>
            <p><strong>Método de Pago:</strong> ${order.payment_method === "cash" ? "Efectivo" : "MercadoPago"}</p>
            <p><strong>Estado del Pago:</strong> ${order.payment_status === "pending" ? "Pendiente" : "Aprobado"}</p>
          </div>
          
          <div class="info-section">
            <h3>Información del Cliente</h3>
            <p><strong>Nombre:</strong> ${order.customer_name || "N/A"}</p>
            <p><strong>Email:</strong> ${order.customer_email || "N/A"}</p>
            <p><strong>Teléfono:</strong> ${order.customer_phone || "N/A"}</p>
            <p><strong>Método de Entrega:</strong> ${order.shipping_method === "pickup" ? "Retiro en sucursal" : "Envío a domicilio"}</p>
            ${order.shipping_method === "delivery" ? `<p><strong>Dirección:</strong> ${order.shipping_address}</p>` : ""}
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Detalles</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${
              order.order_items
                ?.map(
                  (item: any) => `
              <tr>
                <td>${item.product_name}</td>
                <td>
                  ${item.size ? `Talla: ${item.size}` : ""}
                  ${item.color ? `<br>Color: ${item.color}` : ""}
                </td>
                <td>${item.quantity}</td>
                <td>$${Number.parseFloat(item.unit_price).toFixed(2)}</td>
                <td>$${Number.parseFloat(item.total_price).toFixed(2)}</td>
              </tr>
            `,
                )
                .join("") || ""
            }
          </tbody>
        </table>

        <div class="total-section">
          <div style="max-width: 300px; margin-left: auto;">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${(Number.parseFloat(order.total_amount) - Number.parseFloat(order.shipping_cost || 0)).toFixed(2)}</span>
            </div>
            ${
              Number.parseFloat(order.shipping_cost || 0) > 0
                ? `
              <div class="total-row">
                <span>Envío:</span>
                <span>$${Number.parseFloat(order.shipping_cost).toFixed(2)}</span>
              </div>
            `
                : ""
            }
            <div class="total-row total-final">
              <span>Total:</span>
              <span>$${Number.parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Gracias por su compra en OXSTORE</p>
          <p>Para consultas, contáctenos a: info@oxstore.com | Tel: (011) 1234-5678</p>
        </div>
      </body>
      </html>
    `

    return new NextResponse(invoiceHTML, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="factura-${order.order_number}.html"`,
      },
    })
  } catch (error) {
    console.error("Error generating invoice:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
