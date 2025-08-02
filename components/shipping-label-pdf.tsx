"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { Order } from "@/context/order-context" // Asumo que este tipo existe y tiene la info necesaria
import type { ShippingMethod } from "@/lib/shipping"

interface ShippingLabelPDFProps {
  order: Order
  shippingMethod: ShippingMethod
}

export default function ShippingLabelPDF({ order, shippingMethod }: ShippingLabelPDFProps) {
  const generatePDF = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiqueta de Envío - ${order.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&display=swap');
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            .label { width: 4in; height: 6in; padding: 0.25in; border: 2px solid black; box-sizing: border-box; display: flex; flex-direction: column; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid black; padding-bottom: 0.1in; }
            .sender { font-size: 10pt; }
            .shipping-logo { max-height: 40px; }
            .recipient { flex-grow: 1; padding: 0.25in 0; border-bottom: 2px solid black; }
            .recipient h2 { margin: 0 0 0.1in 0; font-size: 14pt; }
            .recipient p { margin: 0; font-size: 12pt; line-height: 1.4; }
            .recipient .name { font-weight: bold; font-size: 16pt; }
            .footer { text-align: center; padding-top: 0.2in; }
            .barcode { font-family: 'Libre Barcode 39 Text', cursive; font-size: 48pt; margin: 0; }
            .order-id { font-size: 12pt; font-weight: bold; }
            @media print { @page { size: 4in 6in; margin: 0; } }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="header">
              <div class="sender">
                <strong>DE:</strong><br>
                OXSTORE<br>
                Av. Artigas 456<br>
                Santa Lucía, Uruguay
              </div>
              <img src="${shippingMethod.logoUrl}" alt="${shippingMethod.name}" class="shipping-logo" />
            </div>
            <div class="recipient">
              <h2>ENVIAR A:</h2>
              <p class="name">${order.shipping.firstName} ${order.shipping.lastName}</p>
              <p>${order.shipping.address}</p>
              <p>${order.shipping.city}, ${order.shipping.postalCode}</p>
              <p>${order.shipping.country}</p>
              <p>Tel: ${order.shipping.phone}</p>
            </div>
            <div class="footer">
              <p class="barcode">*${order.id}*</p>
              <p class="order-id">Pedido: ${order.id}</p>
            </div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <Button onClick={generatePDF} variant="outline">
      <Download className="h-4 w-4 mr-2" />
      Generar Etiqueta
    </Button>
  )
}
