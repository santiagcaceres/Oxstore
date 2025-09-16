export function generateTransferReceiptHTML(orderData: any) {
  const subtotal = orderData.items.reduce((sum: number, item: any) => {
    return sum + Number.parseFloat(item.price) * Number.parseInt(item.quantity)
  }, 0)

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Datos para Transferencia - ${orderData.orderNumber}</title>
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
          border: 2px solid #3b82f6;
        }
        
        .header { 
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 30px;
          text-align: center;
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
        
        .content {
          padding: 30px;
        }
        
        .order-summary {
          background: #eff6ff;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
          border-left: 4px solid #3b82f6;
        }
        
        .order-number {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .bank-info {
          background: #fef3c7;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
          border-left: 4px solid #f59e0b;
        }
        
        .bank-title {
          font-size: 16px;
          font-weight: 600;
          color: #92400e;
          margin-bottom: 15px;
          text-align: center;
        }
        
        .bank-details {
          background: white;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 15px;
        }
        
        .bank-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .bank-row:last-child {
          border-bottom: none;
        }
        
        .bank-label {
          font-weight: 500;
          color: #6b7280;
        }
        
        .bank-value {
          font-weight: 600;
          color: #1f2937;
          font-family: monospace;
        }
        
        .transfer-instructions {
          background: #dbeafe;
          padding: 15px;
          border-radius: 6px;
          color: #1e40af;
          font-size: 14px;
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
          border-top: 3px solid #3b82f6;
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
          <div class="company-name">OXSTORE</div>
          <div class="receipt-title">Datos para Transferencia Bancaria</div>
        </div>
        
        <div class="content">
          <div class="order-summary">
            <div class="order-number">Pedido #${orderData.orderNumber}</div>
            <div>Cliente: ${orderData.customerName}</div>
            <div>Email: ${orderData.customerEmail}</div>
            <div>Fecha: ${new Date(orderData.createdAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</div>
          </div>
          
          <div class="bank-info">
            <div class="bank-title">Datos Bancarios para Transferencia</div>
            
            <div class="bank-details">
              <div class="bank-row">
                <span class="bank-label">Banco:</span>
                <span class="bank-value">Banco República Oriental del Uruguay (BROU)</span>
              </div>
              <div class="bank-row">
                <span class="bank-label">Titular:</span>
                <span class="bank-value">OXSTORE ECOMMERCE</span>
              </div>
              <div class="bank-row">
                <span class="bank-label">Número de Cuenta:</span>
                <span class="bank-value">001518834 00001</span>
              </div>
              <div class="bank-row">
                <span class="bank-label">Alias:</span>
                <span class="bank-value">OXSTORE.PAGO</span>
              </div>
            </div>
            
            <div class="transfer-instructions">
              <strong>Instrucciones importantes:</strong><br>
              • Realiza la transferencia por el monto exacto: $${orderData.total.toFixed(2)}<br>
              • En el concepto incluye tu número de pedido: ${orderData.orderNumber}<br>
              • Envía el comprobante de transferencia por WhatsApp<br>
              • Una vez confirmado el pago, procesaremos tu pedido
            </div>
          </div>

          <div class="total-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
            ${
              orderData.shippingCost > 0
                ? `
            <div class="total-row">
              <span>Costo de Envío:</span>
              <span>$${orderData.shippingCost.toFixed(2)}</span>
            </div>
            `
                : ""
            }
            <div class="total-row total-final">
              <span>MONTO A TRANSFERIR:</span>
              <span>$${orderData.total.toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            <div class="footer-title">OXSTORE - Tu Tienda de Confianza</div>
            <div class="contact-info">📧 info@oxstore.com</div>
            <div class="contact-info">📞 +598 1234 5678</div>
            
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
}
