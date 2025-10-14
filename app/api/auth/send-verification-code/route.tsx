import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 })
    }

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos

    // Guardar código en la base de datos
    const supabase = await createClient()
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        verification_code: code,
        verification_code_expires_at: expiresAt.toISOString(),
      })
      .eq("email", email)

    if (updateError) {
      console.error("[v0] Error guardando código:", updateError)
      return NextResponse.json({ error: "Error guardando código" }, { status: 500 })
    }

    // Enviar email con Resend
    const { data, error } = await resend.emails.send({
      from: "Oxstore <info@oxstoreuy.com>",
      to: [email],
      subject: "Código de verificación - Oxstore",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #000; color: #fff; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 5px; margin: 20px 0; }
              .code { font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; 
                      background: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Oxstore</h1>
              </div>
              <div class="content">
                <h2>Verificá tu email</h2>
                <p>Gracias por registrarte en Oxstore. Para completar tu registro, ingresá el siguiente código de verificación:</p>
                <div class="code">${code}</div>
                <p>Este código expira en 15 minutos.</p>
                <p>Si no solicitaste este código, podés ignorar este email.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Oxstore. Todos los derechos reservados.</p>
                <p>info@oxstoreuy.com</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("[v0] Error enviando email:", error)
      return NextResponse.json({ error: "Error enviando email" }, { status: 500 })
    }

    console.log("[v0] Email enviado exitosamente:", data)
    return NextResponse.json({ success: true, message: "Código enviado" })
  } catch (error) {
    console.error("[v0] Error en send-verification-code:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
