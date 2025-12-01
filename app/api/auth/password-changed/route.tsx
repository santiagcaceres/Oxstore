import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: "Oxstore <info@oxstoreuy.com>",
      to: email,
      subject: "Contraseña Actualizada - Oxstore",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Contraseña Actualizada</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Oxstore</h1>
                        <p style="margin: 10px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Tu tienda de confianza</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">Contraseña Actualizada</h2>
                        
                        <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                          Hola ${firstName} ${lastName},
                        </p>
                        
                        <p style="margin: 0 0 20px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                          Te confirmamos que tu contraseña ha sido actualizada correctamente.
                        </p>
                        
                        <div style="background-color: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
                          <p style="margin: 0; color: #2d3748; font-size: 14px; line-height: 1.6;">
                            <strong>🔒 Información de seguridad:</strong><br/>
                            Fecha y hora del cambio: ${new Date().toLocaleString("es-UY", { timeZone: "America/Montevideo" })}
                          </p>
                        </div>
                        
                        <p style="margin: 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                          Si no realizaste este cambio, por favor contactanos inmediatamente al WhatsApp 
                          <a href="https://wa.me/59892152947" style="color: #667eea; text-decoration: none; font-weight: 600;">092 152 947</a>.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://oxstoreuy.com"}" 
                             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                            Ir a Oxstore
                          </a>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="margin: 0 0 10px; color: #718096; font-size: 14px;">
                          © ${new Date().getFullYear()} Oxstore. Todos los derechos reservados.
                        </p>
                        <p style="margin: 0 0 10px; color: #718096; font-size: 14px;">
                          📍 Santa Lucía, Canelones, Uruguay
                        </p>
                        <p style="margin: 0; color: #718096; font-size: 14px;">
                          📱 WhatsApp: 092 152 947
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("Error sending email:", error)
      return NextResponse.json({ error: "Error al enviar el email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in password-changed route:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
