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

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Factura ${order.order_number}</title>
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
            max-width: 800px;
            margin: 0 auto;
          }
          
          .invoice-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          
          .header { 
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
          }
          
          .logo {
            width: 150px;
            height: auto;
            margin-bottom: 20px;
            filter: brightness(0) invert(1);
          }
          
          .company-name {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: 2px;
          }
          
          .invoice-title {
            font-size: 18px;
            font-weight: 500;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .content {
            padding: 40px;
          }
          
          .invoice-meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .invoice-number {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 8px;
          }
          
          .invoice-date {
            color: #6b7280;
            font-weight: 500;
          }
          
          .order-info { 
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px; 
          }
          
          .info-section {
            background: #f9fafb;
            padding: 24px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          
          .info-section h3 {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 4px 0;
          }
          
          .info-label {
            font-weight: 500;
            color: #6b7280;
          }
          
          .info-value {
            font-weight: 600;
            color: #1f2937;
          }
          
          .items-section {
            margin-bottom: 40px;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .items-table th {
            background: #1f2937;
            color: white;
            padding: 16px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .items-table td { 
            padding: 16px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .items-table tr:last-child td {
            border-bottom: none;
          }
          
          .items-table tr:nth-child(even) {
            background-color: #f9fafb;
          }
          
          .product-name {
            font-weight: 600;
            color: #1f2937;
          }
          
          .product-details {
            font-size: 12px;
            color: #6b7280;
            margin-top: 4px;
          }
          
          .quantity {
            text-align: center;
            font-weight: 600;
          }
          
          .price {
            text-align: right;
            font-weight: 600;
          }
          
          .total-section {
            background: #f9fafb;
            padding: 30px;
            border-radius: 8px;
            margin-top: 30px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 16px;
          }
          
          .total-label {
            font-weight: 500;
            color: #6b7280;
          }
          
          .total-value {
            font-weight: 600;
            color: #1f2937;
          }
          
          .total-final {
            border-top: 2px solid #1f2937;
            padding-top: 16px;
            margin-top: 16px;
            font-size: 20px;
            font-weight: 700;
          }
          
          .total-final .total-label {
            color: #1f2937;
            font-weight: 700;
          }
          
          .total-final .total-value {
            color: #3b82f6;
            font-size: 24px;
          }
          
          .footer {
            margin-top: 50px;
            text-align: center;
            padding: 30px;
            background: #f9fafb;
            border-radius: 8px;
            border-top: 3px solid #3b82f6;
          }
          
          .footer-title {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 12px;
          }
          
          .footer-text {
            color: #6b7280;
            margin-bottom: 8px;
          }
          
          .contact-info {
            font-weight: 500;
            color: #3b82f6;
          }
          
          .payment-status {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .status-pending {
            background: #fef3c7;
            color: #92400e;
          }
          
          .status-approved {
            background: #d1fae5;
            color: #065f46;
          }
          
          @media print {
            body {
              padding: 20px;
            }
            .invoice-container {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-name">OXSTORE</div>
            <div class="invoice-title">Factura de Venta</div>
          </div>
          
          <div class="content">
            <div class="invoice-meta">
              <div>
                <div class="invoice-number">#${order.order_number}</div>
                <div class="invoice-date">Fecha: ${new Date(order.created_at).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</div>
              </div>
              <div style="text-align: right;">
                <div class="payment-status ${order.payment_status === "pending" ? "status-pending" : "status-approved"}">
                  ${order.payment_status === "pending" ? "Pago Pendiente" : "Pago Aprobado"}
                </div>
              </div>
            </div>
            
            <div class="order-info">
              <div class="info-section">
                <h3>Información del Pedido</h3>
                <div class="info-item">
                  <span class="info-label">Método de Pago:</span>
                  <span class="info-value">${order.payment_method === "cash" ? "Efectivo" : "MercadoPago"}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Método de Entrega:</span>
                  <span class="info-value">${order.shipping_method === "pickup" ? "Retiro en Sucursal" : "Envío a Domicilio"}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Estado:</span>
                  <span class="info-value">${order.payment_status === "pending" ? "Pendiente" : "Confirmado"}</span>
                </div>
              </div>
              
              <div class="info-section">
                <h3>Información del Cliente</h3>
                <div class="info-item">
                  <span class="info-label">Nombre:</span>
                  <span class="info-value">${order.customer_name || "N/A"}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${order.customer_email || "N/A"}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Teléfono:</span>
                  <span class="info-value">${order.customer_phone || "N/A"}</span>
                </div>
                ${
                  order.shipping_method === "delivery" && order.shipping_address
                    ? `
                <div class="info-item">
                  <span class="info-label">Dirección:</span>
                  <span class="info-value">${order.shipping_address}</span>
                </div>
                `
                    : ""
                }
              </div>
            </div>

            <div class="items-section">
              <h3 class="section-title">Productos</h3>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style="text-align: center;">Cantidad</th>
                    <th style="text-align: right;">Precio Unit.</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    order.order_items
                      ?.map(
                        (item: any) => `
                    <tr>
                      <td>
                        <div class="product-name">${item.product_name}</div>
                        ${
                          item.size || item.color
                            ? `
                        <div class="product-details">
                          ${item.size ? `Talla: ${item.size}` : ""}
                          ${item.size && item.color ? " • " : ""}
                          ${item.color ? `Color: ${item.color}` : ""}
                        </div>
                        `
                            : ""
                        }
                      </td>
                      <td class="quantity">${item.quantity}</td>
                      <td class="price">$${Number.parseFloat(item.unit_price).toFixed(2)}</td>
                      <td class="price">$${Number.parseFloat(item.total_price).toFixed(2)}</td>
                    </tr>
                  `,
                      )
                      .join("") || ""
                  }
                </tbody>
              </table>
            </div>

            <div class="total-section">
              <div class="total-row">
                <span class="total-label">Subtotal:</span>
                <span class="total-value">$${(Number.parseFloat(order.total_amount) - Number.parseFloat(order.shipping_cost || 0)).toFixed(2)}</span>
              </div>
              ${
                Number.parseFloat(order.shipping_cost || 0) > 0
                  ? `
                <div class="total-row">
                  <span class="total-label">Costo de Envío:</span>
                  <span class="total-value">$${Number.parseFloat(order.shipping_cost).toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              <div class="total-row total-final">
                <span class="total-label">TOTAL:</span>
                <span class="total-value">$${Number.parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>

            <div class="footer">
              <div class="footer-title">¡Gracias por tu compra en OXSTORE!</div>
              <p class="footer-text">Para consultas sobre tu pedido, no dudes en contactarnos:</p>
              <p class="contact-info">📧 info@oxstore.com | 📞 (011) 1234-5678</p>
              <p class="footer-text" style="margin-top: 16px; font-size: 12px;">
                Esta factura es válida como comprobante de compra. Conservala para garantías y devoluciones.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

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
