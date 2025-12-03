import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Generating cash receipt for order ID:", params.id)

    const supabase = createClient()

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          product_name,
          quantity,
          price,
          total_price,
          total
        )
      `)
      .eq("id", params.id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const orderItems = order.order_items || []
    const subtotal = orderItems.reduce((sum: number, item: any) => {
      return sum + (Number.parseFloat(item.total_price) || 0)
    }, 0)

    const shippingCost = Number.parseFloat(order.shipping_cost || 0)
    const totalAmount = Number.parseFloat(order.total_amount || 0)

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Comprobante de Pago en Efectivo - ${order.order_number}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body { 
            font-family: 'Inter', Arial, sans-serif; 
            line-height: 1.6;
            color: #1f2937;
            background: #ffffff;
            padding: 40px;
            max-width: 600px;
            margin: 0 auto;
          }
          
          .receipt-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 2px solid #10b981;
          }
          
          .header { 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          
          .logo-container {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
          }
          
          .company-name {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: 2px;
          }
          
          .receipt-title {
            font-size: 16px;
            font-weight: 500;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .success-badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            margin-top: 12px;
            display: inline-block;
            font-weight: 600;
          }
          
          .content {
            padding: 30px;
          }
          
          .order-summary {
            background: #f0fdf4;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid #10b981;
          }
          
          .order-number {
            font-size: 20px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 8px;
          }
          
          .order-date {
            color: #6b7280;
            font-weight: 500;
          }
          
          .payment-info {
            background: #fef3c7;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid #f59e0b;
          }
          
          .payment-title {
            font-size: 16px;
            font-weight: 600;
            color: #92400e;
            margin-bottom: 12px;
          }
          
          .payment-instructions {
            color: #78350f;
            font-size: 14px;
            line-height: 1.5;
          }
          
          .items-summary {
            margin-bottom: 25px;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .item-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .item-row:last-child {
            border-bottom: none;
          }
          
          .item-name {
            font-weight: 500;
          }
          
          .item-details {
            font-size: 12px;
            color: #6b7280;
          }
          
          .item-price {
            font-weight: 600;
          }
          
          .total-section {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 14px;
          }
          
          .total-final {
            border-top: 2px solid #1f2937;
            padding-top: 12px;
            margin-top: 12px;
            font-size: 18px;
            font-weight: 700;
          }
          
          .footer {
            text-align: center;
            padding: 25px;
            background: #f9fafb;
            border-radius: 8px;
            border-top: 3px solid #10b981;
          }
          
          .footer-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
          }
          
          .contact-info {
            color: #6b7280;
            margin-bottom: 6px;
            font-size: 14px;
          }
          
          .hours-info {
            margin-top: 15px;
            padding: 12px;
            background: #e5e7eb;
            border-radius: 6px;
          }
          
          .hours-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 6px;
            font-size: 14px;
          }
          
          .hours-text {
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="logo-container">
              <div class="company-name">OXSTORE</div>
            </div>
            <div class="receipt-title">Comprobante de Pago en Efectivo</div>
            <div class="success-badge">✓ PAGO CONFIRMADO</div>
          </div>
          
          <div class="content">
            <div class="order-summary">
              <div class="order-number">Pedido #${order.order_number}</div>
              <div class="order-date">Fecha: ${new Date(order.created_at).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</div>
            </div>
            
            <div class="payment-info">
              <div class="payment-title">Instrucciones de Pago</div>
              <div class="payment-instructions">
                ${
                  order.shipping_method === "pickup"
                    ? "El pago se realizará en efectivo al momento del retiro en nuestra sucursal. Por favor, presenta este comprobante junto con tu documento de identidad."
                    : "El pago se realizará en efectivo al momento de la entrega. Nuestro repartidor te contactará para coordinar la entrega y el pago."
                }
              </div>
            </div>

            <div class="items-summary">
              <h3 class="section-title">Resumen del Pedido</h3>
              ${orderItems
                .map(
                  (item: any) => `
                <div class="item-row">
                  <div>
                    <div class="item-name">${item.product_name || "Producto"}</div>
                    <div class="item-details">Cantidad: ${item.quantity}</div>
                  </div>
                  <div class="item-price">$${(Number.parseFloat(item.total_price) || 0).toFixed(2)}</div>
                </div>
              `,
                )
                .join("")}
            </div>

            <div class="total-section">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
              </div>
              ${
                shippingCost > 0
                  ? `
                <div class="total-row">
                  <span>Costo de Envío:</span>
                  <span>$${shippingCost.toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              <div class="total-row total-final">
                <span>TOTAL A PAGAR:</span>
                <span>$${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div class="footer">
              <div class="footer-title">OXSTORE - Tu Tienda de Confianza</div>
              <div class="contact-info">📧 info@oxstore.com</div>
              <div class="contact-info">📞 (011) 1234-5678</div>
              
              <div class="hours-info">
                <div class="hours-title">Horarios de Atención</div>
                <div class="hours-text">Lunes a Viernes: 09:00 - 12:00 y 14:00 - 19:00</div>
                <div class="hours-text">Sábados: 09:00 - 13:00</div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    return new NextResponse(receiptHTML, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="Comprobante-Efectivo-OXSTORE-${order.order_number}.html"`,
      },
    })
  } catch (error) {
    console.error("Error generating cash receipt:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
