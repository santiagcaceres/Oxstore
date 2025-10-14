import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 })
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    const supabase = await createClient()
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        verification_code: verificationCode,
        verification_code_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      })
      .eq("email", email)

    if (updateError) {
      console.error("Error updating verification code:", updateError)
      return NextResponse.json({ error: "Error guardando código de verificación" }, { status: 500 })
    }

    const { error: emailError } = await resend.emails.send({
      from: "OXSTORE <info@oxstoreuy.com>",
      to: email,
      subject: "Código de Verificación - OXSTORE",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #000; text-align: center; margin-bottom: 30px;">OXSTORE</h1>
          <div style="background-color: #f5f5f5; padding: 30px; border-radius: 8px; text-align: center;">
            <h2 style="color: #000; margin-bottom: 20px;">Tu Código de Verificación</h2>
            <div style="background-color: #fff; padding: 20px; border-radius: 4px; margin: 20px 0;">
              <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0; color: #000;">
                ${verificationCode}
              </p>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">Este código expira en 15 minutos</p>
            <p style="color: #666; font-size: 14px;">Si no solicitaste este código, puedes ignorar este email</p>
          </div>
        </div>
      `,
    })

    if (emailError) {
      console.error("Error sending email:", emailError)
      return NextResponse.json({ error: "Error enviando email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in send-verification-code:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
