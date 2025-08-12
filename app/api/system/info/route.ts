import { NextResponse } from "next/server"

export async function GET() {
  try {
    const envVars = [
      { name: "ZUREO_API_USER", configured: !!process.env.ZUREO_API_USER },
      { name: "ZUREO_API_PASSWORD", configured: !!process.env.ZUREO_API_PASSWORD },
      { name: "ZUREO_DOMAIN", configured: !!process.env.ZUREO_DOMAIN },
      { name: "ZUREO_COMPANY_ID", configured: !!process.env.ZUREO_COMPANY_ID },
      { name: "BLOB_READ_WRITE_TOKEN", configured: !!process.env.BLOB_READ_WRITE_TOKEN },
      { name: "NEXT_PUBLIC_SUPABASE_URL", configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL },
      { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", configured: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
      { name: "MERCADOPAGO_ACCESS_TOKEN", configured: !!process.env.MERCADOPAGO_ACCESS_TOKEN },
    ]

    return NextResponse.json({
      success: true,
      envVars,
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}
