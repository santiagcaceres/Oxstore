"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface InvoicePDFProps {
  order: {
    id: string
    date: string
    customerInfo: {
      name: string
      email: string
      address: string
      city: string
      postalCode: string
    }
    items: Array<{
      title: string
      quantity: number
      price: number
    }>
    subtotal: number
    shipping: number
    total: number
  }
}

export default function InvoicePDF({ order }: InvoicePDFProps) {
  const generatePDF = () => {
    // Crear contenido HTML para el PDF
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Factura #${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #1e3a8a; }
          .invoice-info { margin-bottom: 30px; }
          .customer-info { margin-bottom: 30px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .items-table th { background-color: #f8f9fa; }
          .totals { text-align: right; }
          .total-row { font-weight: bold; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">OXSTORE</div>
          <h2>Factura de Compra</h2>
        </div>
        
        <div class="invoice-info">
          <p><strong>Número de Factura:</strong> #${order.id}</p>
          <p><strong>Fecha:</strong> ${order.date}</p>
        </div>
        
        <div class="customer-info">
          <h3>Información del Cliente</h3>
          <p><strong>Nombre:</strong> ${order.customerInfo.name}</p>
          <p><strong>Email:</strong> ${order.customerInfo.email}</p>
          <p><strong>Dirección:</strong> ${order.customerInfo.address}</p>
          <p><strong>Ciudad:</strong> ${order.customerInfo.city}</p>
          <p><strong>Código Postal:</strong> ${order.customerInfo.postalCode}</p>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td>${item.title}</td>
                <td>${item.quantity}</td>
                <td>$${item.price}</td>
                <td>$${item.quantity * item.price}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="totals">
          <p>Subtotal: $${order.subtotal}</p>
          <p>Envío: $${order.shipping}</p>
          <p class="total-row">Total: $${order.total}</p>
        </div>
        
        <div style="margin-top: 40px; text-align: center; color: #666;">
          <p>Gracias por tu compra en OXSTORE</p>
          <p>Para consultas: info@oxstore.com | +1 234 567 8900</p>
        </div>
      </body>
      </html>
    `

    // Crear y descargar el PDF
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(invoiceHTML)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  return (
    <Button onClick={generatePDF} className="bg-blue-950 hover:bg-blue-900">
      <Download className="h-4 w-4 mr-2" />
      Descargar Factura PDF
    </Button>
  )
}
