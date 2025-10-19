import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName } = await request.json()

    console.log("[v0] Enviando email de bienvenida:", { email, firstName, lastName })

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 })
    }

    const { data, error: emailError } = await resend.emails.send({
      from: "Oxstore <info@oxstoreuy.com>",
      to: [email],
      subject: "¡Bienvenido a Oxstore!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #000; margin-bottom: 20px;">¡Bienvenido a Oxstore, ${firstName}!</h2>
          <p style="color: #333; margin-bottom: 20px;">
            Gracias por registrarte en Oxstore. Tu cuenta ha sido creada exitosamente.
          </p>
          <p style="color: #333; margin-bottom: 20px;">
            Ya puedes iniciar sesión y comenzar a comprar los mejores productos de moda.
          </p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="color: #666; margin: 0; text-align: center;">
              <strong>¿Necesitas ayuda?</strong><br/>
              Contáctanos en info@oxstoreuy.com
            </p>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            Este es un email automático, por favor no respondas a este mensaje.
          </p>
        </div>
      `,
    })

    if (emailError) {
      console.error("[v0] Error enviando email:", emailError)
      return NextResponse.json({ error: "Error al enviar el email" }, { status: 500 })
    }

    console.log("[v0] Email de bienvenida enviado exitosamente:", data)

    return NextResponse.json({ success: true, message: "Email de bienvenida enviado correctamente" })
  } catch (error) {
    console.error("[v0] Error en send-verification-code:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
