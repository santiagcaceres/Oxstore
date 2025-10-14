import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    console.log("[v0] Enviando código de verificación:", { email, code })

    if (!email || !code) {
      return NextResponse.json({ error: "Email y código son requeridos" }, { status: 400 })
    }

    const { data, error: emailError } = await resend.emails.send({
      from: "Oxstore <info@oxstoreuy.com>",
      to: [email],
      subject: "Código de verificación - Oxstore",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #000; margin-bottom: 20px;">Verifica tu cuenta en Oxstore</h2>
          <p style="color: #333; margin-bottom: 20px;">Gracias por registrarte. Tu código de verificación es:</p>
          <div style="background-color: #f5f5f5; padding: 30px; text-align: center; border-radius: 8px; margin: 30px 0;">
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #000;">
              ${code}
            </div>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">Este código expira en 15 minutos.</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            Si no solicitaste este código, puedes ignorar este email.
          </p>
        </div>
      `,
    })

    if (emailError) {
      console.error("[v0] Error enviando email:", emailError)
      return NextResponse.json({ error: "Error al enviar el email" }, { status: 500 })
    }

    console.log("[v0] Código enviado exitosamente:", data)

    return NextResponse.json({ success: true, message: "Código enviado correctamente" })
  } catch (error) {
    console.error("[v0] Error en send-verification-code:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
