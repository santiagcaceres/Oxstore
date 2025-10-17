import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create Supabase client with service role key to bypass RLS
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const subcategorySlug = formData.get("subcategorySlug") as string
    const gender = formData.get("gender") as string | null

    if (!file || !subcategorySlug) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "La imagen no debe superar los 5MB" }, { status: 400 })
    }

    // Upload file to storage
    const fileName = `size-guide-${subcategorySlug}-${gender || "all"}-${Date.now()}.${file.name.split(".").pop()}`
    const fileBuffer = await file.arrayBuffer()

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("size-guides")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return NextResponse.json({ error: `Error subiendo imagen: ${uploadError.message}` }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("size-guides").getPublicUrl(fileName)

    // Upsert size guide record using service role (bypasses RLS)
    const { error: upsertError } = await supabaseAdmin.from("size_guides").upsert(
      {
        subcategory: subcategorySlug,
        gender: gender,
        image_url: publicUrl,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "subcategory,gender",
      },
    )

    if (upsertError) {
      console.error("Error upserting size guide:", upsertError)
      return NextResponse.json({ error: `Error guardando guía de talles: ${upsertError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
    })
  } catch (error) {
    console.error("Error in size guide upload:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 })
  }
}
