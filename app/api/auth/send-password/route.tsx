import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, password } = await request.json()

    console.log("[v0] Enviando email con contraseña:", { email, firstName, lastName })

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    const { data, error: emailError } = await resend.emails.send({
      from: "Oxstore <info@oxstoreuy.com>",
      to: [email],
      subject: "¡Bienvenido a Oxstore! - Tu contraseña temporal",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #000; margin-bottom: 20px;">¡Bienvenido a Oxstore, ${firstName}!</h2>
          <p style="color: #333; margin-bottom: 20px;">
            Gracias por registrarte en Oxstore. Tu cuenta ha sido creada exitosamente.
          </p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #000; margin-top: 0;">Tus datos de acceso</h3>
            <p style="color: #333; margin: 10px 0;">
              <strong>Email:</strong> ${email}
            </p>
            <p style="color: #333; margin: 10px 0;">
              <strong>Contraseña temporal:</strong> <span style="background-color: #fff; padding: 5px 10px; border-radius: 4px; font-family: monospace; font-size: 16px;">${password}</span>
            </p>
          </div>

          <p style="color: #333; margin-bottom: 20px;">
            Por seguridad, te recomendamos cambiar esta contraseña temporal desde tu perfil después de iniciar sesión.
          </p>

          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/auth/login" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Iniciar Sesión
          </a>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="color: #666; margin: 0; text-align: center;">
              <strong>¿Necesitas ayuda?</strong><br/>
              Contáctanos por WhatsApp: 092 152 947<br/>
              O escríbenos a: info@oxstoreuy.com
            </p>
          </div>

          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            Este es un email automático, por favor no respondas a este mensaje.<br/>
            Santa Lucía, Canelones - Uruguay
          </p>
        </div>
      `,
    })

    if (emailError) {
      console.error("[v0] Error enviando email:", emailError)
      return NextResponse.json({ error: "Error al enviar el email" }, { status: 500 })
    }

    console.log("[v0] Email con contraseña enviado exitosamente:", data)

    return NextResponse.json({ success: true, message: "Email con contraseña enviado correctamente" })
  } catch (error) {
    console.error("[v0] Error en send-password:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
