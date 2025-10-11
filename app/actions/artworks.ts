"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const SUPABASE_ENABLED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  (!!process.env.SUPABASE_SERVICE_ROLE_KEY || !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

const BUCKET_NAME = "artworks"

// Datos de ejemplo con múltiples imágenes placeholder - ACTUALIZADO CON TÉCNICA MIXTA
const SAMPLE_ARTWORKS = [
  {
    id: "sample-1",
    title: "Encuentro en el Bosque",
    category: "acrilicos",
    subcategory: "espatula",
    price: 2800,
    description: "Acrílico con espátula sobre lienzo, 60x80cm",
    detailed_description:
      "Una obra que explora la conexión entre el ser humano y la naturaleza. Las figuras bajo los árboles representan momentos de contemplación y refugio espiritual. La técnica de espátula aporta textura y profundidad emocional, creando un diálogo entre lo consciente y lo inconsciente.",
    year: 2024,
    dimensions: "60 x 80 cm",
    technique: "Acrílico con espátula sobre lienzo",
    status: "Disponible",
    featured: true,
    main_image_url: "https://placehold.co/800x600/8B4513/FFFFFF/jpeg?text=Encuentro+en+el+Bosque+-+Vista+Principal",
    gallery: [
      "https://placehold.co/800x600/8B4513/FFFFFF/jpeg?text=Encuentro+en+el+Bosque+-+Vista+Principal",
      "https://placehold.co/800x600/A0522D/FFFFFF/jpeg?text=Encuentro+en+el+Bosque+-+Detalle+Izquierdo",
      "https://placehold.co/800x600/CD853F/FFFFFF/jpeg?text=Encuentro+en+el+Bosque+-+Vista+Completa",
    ],
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "sample-2",
    title: "Retrato de la Vulnerabilidad",
    category: "oleos",
    price: 1900,
    description: "Óleo sobre lienzo, 45x60cm",
    detailed_description:
      "Un retrato intenso que captura la vulnerabilidad humana a través de tonos púrpuras y rosados. La mirada del sujeto trasciende lo físico para adentrarse en territorios emocionales profundos. Cada pincelada busca revelar lo que las palabras no pueden expresar.",
    year: 2024,
    dimensions: "45 x 60 cm",
    technique: "Óleo sobre lienzo",
    status: "Disponible",
    featured: true,
    main_image_url: "https://placehold.co/800x600/9370DB/FFFFFF/jpeg?text=Retrato+Vulnerabilidad+-+Frontal",
    gallery: [
      "https://placehold.co/800x600/9370DB/FFFFFF/jpeg?text=Retrato+Vulnerabilidad+-+Frontal",
      "https://placehold.co/800x600/BA55D3/FFFFFF/jpeg?text=Retrato+Vulnerabilidad+-+Perfil",
      "https://placehold.co/800x600/DDA0DD/000000/jpeg?text=Retrato+Vulnerabilidad+-+Detalle+Ojos",
    ],
    created_at: "2024-01-14T10:00:00Z",
  },
  {
    id: "sample-3",
    title: "Explosión Cromática",
    category: "acuarelas",
    price: 850,
    description: "Acuarela sobre papel, 30x40cm",
    detailed_description:
      "Una explosión de color y emoción capturada en acuarela. Los pigmentos fluyen libremente creando formas orgánicas que evocan paisajes internos. La transparencia del medio permite que cada capa dialogue con la anterior, construyendo significados múltiples.",
    year: 2024,
    dimensions: "30 x 40 cm",
    technique: "Acuarela sobre papel",
    status: "Disponible",
    featured: true,
    main_image_url: "https://placehold.co/800x600/FF6347/FFFFFF/jpeg?text=Explosión+Cromática+-+Centro",
    gallery: [
      "https://placehold.co/800x600/FF6347/FFFFFF/jpeg?text=Explosión+Cromática+-+Centro",
      "https://placehold.co/800x600/FF7F50/FFFFFF/jpeg?text=Explosión+Cromática+-+Esquina+Superior",
      "https://placehold.co/800x600/FFA07A/000000/jpeg?text=Explosión+Cromática+-+Textura+Detalle",
    ],
    created_at: "2024-01-13T10:00:00Z",
  },
  {
    id: "sample-4",
    title: "Conexiones Invisibles",
    category: "oleos",
    price: 3200,
    description: "Óleo sobre lienzo, 70x90cm",
    detailed_description:
      "Una obra compleja que explora las conexiones invisibles entre las personas. Los hilos rojos que atraviesan la composición simbolizan los vínculos emocionales que nos unen más allá del espacio físico. Una reflexión sobre la interdependencia humana.",
    year: 2024,
    dimensions: "70 x 90 cm",
    technique: "Óleo sobre lienzo",
    status: "Vendida",
    featured: true,
    main_image_url: "https://placehold.co/800x600/DC143C/FFFFFF/jpeg?text=Conexiones+Invisibles+-+Hilos+Rojos",
    gallery: [
      "https://placehold.co/800x600/DC143C/FFFFFF/jpeg?text=Conexiones+Invisibles+-+Hilos+Rojos",
      "https://placehold.co/800x600/B22222/FFFFFF/jpeg?text=Conexiones+Invisibles+-+Figuras+Centrales",
      "https://placehold.co/800x600/8B0000/FFFFFF/jpeg?text=Conexiones+Invisibles+-+Vista+Lateral",
    ],
    created_at: "2024-01-12T10:00:00Z",
  },
  {
    id: "sample-5",
    title: "Momento de Introspección",
    category: "acrilicos",
    price: 1600,
    description: "Acrílico sobre lienzo, 50x65cm",
    detailed_description:
      "Una escena doméstica que trasciende lo cotidiano. La figura femenina en reposo invita a la contemplación sobre los momentos de pausa en nuestras vidas aceleradas. Los colores cálidos crean una atmósfera de intimidad y reflexión.",
    year: 2024,
    dimensions: "50 x 65 cm",
    technique: "Acrílico sobre lienzo",
    status: "Disponible",
    featured: false,
    main_image_url: "https://placehold.co/800x600/F4A460/000000/jpeg?text=Momento+Introspección+-+Figura+Principal",
    gallery: [
      "https://placehold.co/800x600/F4A460/000000/jpeg?text=Momento+Introspección+-+Figura+Principal",
      "https://placehold.co/800x600/DEB887/000000/jpeg?text=Momento+Introspección+-+Ambiente+Completo",
    ],
    created_at: "2024-01-11T10:00:00Z",
  },
  {
    id: "sample-6",
    title: "Estudio de Expresión",
    category: "dibujos",
    price: 720,
    description: "Carboncillo sobre papel, 40x50cm",
    detailed_description:
      "Un dibujo que captura la esencia del modelo con trazos seguros y expresivos. El carboncillo permite crear contrastes dramáticos entre luz y sombra, revelando no solo la forma física sino también el carácter del sujeto.",
    year: 2024,
    dimensions: "40 x 50 cm",
    technique: "Carboncillo sobre papel",
    status: "Disponible",
    featured: false,
    main_image_url: "https://placehold.co/800x600/696969/FFFFFF/jpeg?text=Estudio+Expresión+-+Rostro+Principal",
    gallery: [
      "https://placehold.co/800x600/696969/FFFFFF/jpeg?text=Estudio+Expresión+-+Rostro+Principal",
      "https://placehold.co/800x600/778899/FFFFFF/jpeg?text=Estudio+Expresión+-+Trazos+Detalle",
    ],
    created_at: "2024-01-10T10:00:00Z",
  },
  // 🆕 NUEVA OBRA DE EJEMPLO CON TÉCNICA MIXTA
  {
    id: "sample-7",
    title: "Fusión de Elementos",
    category: "tecnica-mixta",
    price: 2400,
    description: "Técnica mixta sobre madera, 80x100cm",
    detailed_description:
      "Una exploración de la combinación de diferentes medios artísticos. Esta obra fusiona acrílico, óleo pastel y elementos de collage para crear una composición rica en texturas y significados. Cada técnica aporta su propia voz al diálogo visual.",
    year: 2024,
    dimensions: "80 x 100 cm",
    technique: "Acrílico, óleo pastel y collage sobre madera",
    status: "Disponible",
    featured: false,
    main_image_url: "https://placehold.co/800x600/8A2BE2/FFFFFF/jpeg?text=Fusión+de+Elementos+-+Vista+General",
    gallery: [
      "https://placehold.co/800x600/8A2BE2/FFFFFF/jpeg?text=Fusión+de+Elementos+-+Vista+General",
      "https://placehold.co/800x600/9932CC/FFFFFF/jpeg?text=Fusión+de+Elementos+-+Detalle+Textura",
      "https://placehold.co/800x600/BA55D3/000000/jpeg?text=Fusión+de+Elementos+-+Detalle+Collage",
    ],
    created_at: "2024-01-09T10:00:00Z",
  },
  {
    id: "sample-8",
    title: "Paisaje Interior",
    category: "otros",
    price: 2400,
    description: "Técnica mixta sobre madera, 80x100cm",
    detailed_description:
      "Una interpretación abstracta del paisaje uruguayo que trasciende lo geográfico para adentrarse en territorios emocionales. La combinación de diferentes medios crea texturas y profundidades que evocan tanto el paisaje externo como el interno.",
    year: 2024,
    dimensions: "80 x 100 cm",
    technique: "Técnica mixta sobre madera",
    status: "Disponible",
    featured: false,
    main_image_url: "https://placehold.co/800x600/228B22/FFFFFF/jpeg?text=Paisaje+Interior+-+Vista+General",
    gallery: [
      "https://placehold.co/800x600/228B22/FFFFFF/jpeg?text=Paisaje+Interior+-+Vista+General",
      "https://placehold.co/800x600/32CD32/FFFFFF/jpeg?text=Paisaje+Interior+-+Textura+Izquierda",
      "https://placehold.co/800x600/90EE90/000000/jpeg?text=Paisaje+Interior+-+Detalle+Madera",
    ],
    created_at: "2024-01-08T10:00:00Z",
  },
]

export async function getArtworks() {
  if (!SUPABASE_ENABLED) {
    console.log("Supabase not configured, returning sample data")
    return SAMPLE_ARTWORKS
  }

  const supabase = createClient()
  const { data, error } = await supabase.from("artworks").select("*").order("created_at", { ascending: false })
  if (error) {
    console.error("Error fetching artworks:", error.message)
    console.log("Falling back to sample data")
    return SAMPLE_ARTWORKS
  }
  return data || SAMPLE_ARTWORKS
}

export async function getFeaturedArtworks() {
  if (!SUPABASE_ENABLED) {
    console.log("Supabase not configured, returning sample featured data")
    return SAMPLE_ARTWORKS.filter((artwork) => artwork.featured)
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from("artworks")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: false })
  if (error) {
    console.error("Error fetching featured artworks:", error.message)
    console.log("Falling back to sample featured data")
    return SAMPLE_ARTWORKS.filter((artwork) => artwork.featured)
  }
  return data || SAMPLE_ARTWORKS.filter((artwork) => artwork.featured)
}

export async function getArtworkById(id: string) {
  if (!SUPABASE_ENABLED) {
    console.log("Supabase not configured, returning sample artwork by ID")
    const artwork = SAMPLE_ARTWORKS.find((art) => art.id === id)
    return artwork || null
  }

  const supabase = createClient()

  // Obtener la obra principal
  const { data: artwork, error: artworkError } = await supabase.from("artworks").select("*").eq("id", id).single()

  if (artworkError) {
    console.error("Error fetching artwork:", artworkError.message)
    console.log("Falling back to sample artwork by ID")
    const sampleArtwork = SAMPLE_ARTWORKS.find((art) => art.id === id)
    return sampleArtwork || null
  }

  // Obtener todas las imágenes de la galería
  const { data: images, error: imagesError } = await supabase
    .from("artwork_images")
    .select("image_url")
    .eq("artwork_id", id)
    .order("created_at", { ascending: true })

  if (imagesError) {
    console.error("Error fetching artwork images:", imagesError.message)
  }

  // Crear array completo de imágenes: principal + galería (sin duplicados)
  const allImages = []
  const seenImages = new Set()

  // Agregar imagen principal si existe y es válida
  if (artwork.main_image_url && artwork.main_image_url.trim() !== "") {
    allImages.push(artwork.main_image_url)
    seenImages.add(artwork.main_image_url)
  }

  // Agregar imágenes de galería si existen (evitando duplicados)
  if (images && images.length > 0) {
    images.forEach((img) => {
      if (img.image_url && img.image_url.trim() !== "" && !seenImages.has(img.image_url)) {
        allImages.push(img.image_url)
        seenImages.add(img.image_url)
      }
    })
  }

  console.log(`Artwork ${id} loaded with ${allImages.length} images:`, allImages)

  return {
    ...artwork,
    gallery: allImages, // Todas las imágenes válidas en un solo array
  }
}

export async function createArtwork(formData: FormData) {
  console.log("🚀 Starting createArtwork function")

  if (!SUPABASE_ENABLED) {
    console.log("❌ Supabase not configured, simulating creation")
    // Simular creación exitosa para testing
    const mockArtwork = {
      id: `mock-${Date.now()}`,
      title: formData.get("title") as string,
      category: formData.get("category") as string,
      price: Number(formData.get("price")),
      status: "Disponible",
      created_at: new Date().toISOString(),
    }
    console.log("✅ Mock artwork created:", mockArtwork)
    return mockArtwork
  }

  const supabase = createClient()

  try {
    const rawFormData = Object.fromEntries(formData.entries())
    const images = formData.getAll("images") as File[]

    console.log("📝 Form data received:", {
      title: rawFormData.title,
      category: rawFormData.category,
      price: rawFormData.price,
      imagesCount: images.length,
    })

    // Validar que hay imágenes
    if (!images || images.length === 0 || images[0].size === 0) {
      throw new Error("Debes seleccionar al menos una imagen")
    }

    console.log("✅ Validation passed, starting image upload...")

    let mainImageUrl = null
    const galleryUrls: string[] = []

    // 1. Subir todas las imágenes
    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      if (image && image.size > 0) {
        const timestamp = Date.now()
        const fileName = `${timestamp}-${i}-${image.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

        console.log(`📤 Uploading image ${i + 1}/${images.length}: ${fileName}`)

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, image, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          console.error(`❌ Error uploading image ${i + 1}:`, uploadError)
          throw new Error(`Error subiendo imagen ${i + 1}: ${uploadError.message}`)
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)

        console.log(`✅ Image ${i + 1} uploaded successfully: ${publicUrl}`)

        if (i === 0) {
          mainImageUrl = publicUrl // Primera imagen como principal
        }
        galleryUrls.push(publicUrl) // Todas las imágenes van a la galería
      }
    }

    if (!mainImageUrl) {
      throw new Error("No se pudo subir ninguna imagen")
    }

    console.log("📸 Images uploaded successfully:", {
      mainImageUrl,
      galleryCount: galleryUrls.length,
    })

    // 2. Preparar datos de la obra
    const artworkData = {
      title: rawFormData.title as string,
      category: rawFormData.category as string,
      subcategory: (rawFormData.subcategory as string) || null,
      price: Number(rawFormData.price),
      description: rawFormData.description as string,
      detailed_description: (rawFormData.detailedDescription as string) || null,
      year: Number(rawFormData.year) || new Date().getFullYear(),
      dimensions: (rawFormData.dimensions as string) || null,
      technique: (rawFormData.technique as string) || null,
      status: (rawFormData.status as string) || "Disponible",
      featured: rawFormData.featured === "on",
      main_image_url: mainImageUrl,
    }

    console.log("💾 Inserting artwork data:", artworkData)

    // 3. Insertar obra en la base de datos
    const { data: insertedArtwork, error: artworkError } = await supabase
      .from("artworks")
      .insert(artworkData)
      .select()
      .single()

    if (artworkError) {
      console.error("❌ Error creating artwork:", artworkError)
      // Limpiar imágenes subidas si falla la inserción
      const filesToDelete = galleryUrls.map((url) => url.split("/").pop()).filter(Boolean)
      if (filesToDelete.length > 0) {
        console.log("🧹 Cleaning up uploaded images...")
        await supabase.storage.from(BUCKET_NAME).remove(filesToDelete)
      }
      throw new Error(`Error al crear la obra: ${artworkError.message}`)
    }

    console.log("✅ Artwork created successfully:", insertedArtwork)

    // 4. Insertar imágenes de galería
    if (galleryUrls.length > 0 && insertedArtwork?.id) {
      const galleryInserts = galleryUrls.map((url) => ({
        artwork_id: insertedArtwork.id,
        image_url: url,
      }))

      console.log("🖼️ Inserting gallery images:", galleryInserts.length)

      const { error: galleryError } = await supabase.from("artwork_images").insert(galleryInserts)

      if (galleryError) {
        console.error("⚠️ Error inserting gallery images:", galleryError)
        // No lanzar error aquí, la obra ya se creó
      } else {
        console.log("✅ Gallery images inserted successfully")
      }
    }

    // 5. Revalidar páginas
    console.log("🔄 Revalidating pages...")
    revalidatePath("/admin/obras")
    revalidatePath("/obras")
    revalidatePath("/")

    console.log("🎉 Artwork creation completed successfully!")
    return insertedArtwork
  } catch (error) {
    console.error("💥 Error in createArtwork:", error)
    throw error
  }
}

export async function updateArtwork(id: string, formData: FormData) {
  console.log("🚀 Starting updateArtwork function for ID:", id)

  if (!SUPABASE_ENABLED) {
    console.log("❌ Supabase not configured, simulating update")
    // Simular actualización exitosa para testing
    const mockArtwork = {
      id: id,
      title: formData.get("title") as string,
      category: formData.get("category") as string,
      price: Number(formData.get("price")),
      status: formData.get("status") as string,
      updated_at: new Date().toISOString(),
    }
    console.log("✅ Mock artwork updated:", mockArtwork)
    return mockArtwork
  }

  const supabase = createClient()

  try {
    const rawFormData = Object.fromEntries(formData.entries())
    const images = formData.getAll("images") as File[]

    console.log("📝 Update data received:", {
      title: rawFormData.title,
      category: rawFormData.category,
      price: rawFormData.price,
      newImagesCount: images.length,
    })

    // 1. Preparar datos de actualización (campos de texto)
    const artworkUpdateData: { [key: string]: any } = {
      title: rawFormData.title as string,
      category: rawFormData.category as string,
      subcategory: (rawFormData.subcategory as string) || null,
      price: Number(rawFormData.price),
      description: rawFormData.description as string,
      detailed_description: (rawFormData.detailedDescription as string) || null,
      year: Number(rawFormData.year) || new Date().getFullYear(),
      dimensions: (rawFormData.dimensions as string) || null,
      technique: (rawFormData.technique as string) || null,
      status: (rawFormData.status as string) || "Disponible",
      featured: rawFormData.featured === "on",
    }

    // 2. Manejar reemplazo de imágenes si se proporcionan nuevas
    if (images.length > 0 && images[0].size > 0) {
      console.log("🖼️ Processing new images...")

      // Obtener URLs de imágenes actuales para eliminarlas del storage
      const { data: currentGalleryImages, error: galleryFetchError } = await supabase
        .from("artwork_images")
        .select("image_url")
        .eq("artwork_id", id)

      if (galleryFetchError) {
        console.error("❌ Error fetching current images:", galleryFetchError)
        throw new Error("Error al obtener imágenes actuales.")
      }

      // Eliminar archivos del storage
      const filesToDelete = currentGalleryImages?.map((img) => img.image_url.split("/").pop()).filter(Boolean) || []
      if (filesToDelete.length > 0) {
        console.log("🧹 Deleting old images from storage:", filesToDelete.length)
        const { error: deleteError } = await supabase.storage.from(BUCKET_NAME).remove(filesToDelete as string[])
        if (deleteError) {
          console.error("⚠️ Error deleting old images:", deleteError)
        }
      }

      // Eliminar registros de galería de la base de datos
      const { error: deleteGalleryError } = await supabase.from("artwork_images").delete().eq("artwork_id", id)
      if (deleteGalleryError) {
        console.error("❌ Error deleting gallery records:", deleteGalleryError)
      }

      // Subir nuevas imágenes
      const newImageUrls: string[] = []
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        const timestamp = Date.now()
        const filePath = `${timestamp}-${i}-${image.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

        console.log(`📤 Uploading new image ${i + 1}/${images.length}: ${filePath}`)

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, image)

        if (uploadError) {
          console.error(`❌ Error uploading new image ${i + 1}:`, uploadError)
          throw new Error(`Error subiendo la nueva imagen ${i + 1}: ${uploadError.message}`)
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

        newImageUrls.push(publicUrl)
        console.log(`✅ New image ${i + 1} uploaded: ${publicUrl}`)
      }

      // Establecer nueva imagen principal
      artworkUpdateData.main_image_url = newImageUrls[0] || null

      // Insertar nuevos registros de galería
      if (newImageUrls.length > 0) {
        const galleryInserts = newImageUrls.map((url) => ({ artwork_id: id, image_url: url }))
        console.log("🖼️ Inserting new gallery images:", galleryInserts.length)

        const { error: galleryInsertError } = await supabase.from("artwork_images").insert(galleryInserts)
        if (galleryInsertError) {
          console.error("⚠️ Error inserting new gallery images:", galleryInsertError.message)
        } else {
          console.log("✅ New gallery images inserted successfully")
        }
      }
    }

    // 3. Actualizar el registro de la obra en la base de datos
    console.log("💾 Updating artwork record...")
    const { data: updatedArtwork, error: updateError } = await supabase
      .from("artworks")
      .update(artworkUpdateData)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("❌ Error updating artwork:", updateError)
      throw new Error(`Error al actualizar la obra: ${updateError.message}`)
    }

    console.log("✅ Artwork updated successfully:", updatedArtwork)

    // 4. Revalidar páginas
    console.log("🔄 Revalidating pages...")
    revalidatePath("/admin/obras")
    revalidatePath(`/admin/obras/${id}/editar`)
    revalidatePath("/obras")
    revalidatePath(`/obra/${id}`)
    revalidatePath("/")

    console.log("🎉 Artwork update completed successfully!")
    return updatedArtwork
  } catch (error) {
    console.error("💥 Error in updateArtwork:", error)
    throw error
  }
}

export async function deleteArtwork(id: string) {
  const supabase = createClient()

  // Primero obtener la obra para eliminar la imagen del storage
  const { data: artwork } = await supabase.from("artworks").select("main_image_url").eq("id", id).single()
  const { data: gallery } = await supabase.from("artwork_images").select("image_url").eq("artwork_id", id)

  // Eliminar imagen principal del storage si existe
  if (artwork?.main_image_url) {
    const fileName = artwork.main_image_url.split("/").pop()
    if (fileName) {
      await supabase.storage.from(BUCKET_NAME).remove([fileName])
    }
  }

  // Eliminar imágenes de galería del storage
  if (gallery && gallery.length > 0) {
    const filesToDelete = gallery.map((img) => img.image_url.split("/").pop()).filter(Boolean)
    if (filesToDelete.length > 0) {
      await supabase.storage.from(BUCKET_NAME).remove(filesToDelete)
    }
  }

  // Eliminar la obra de la base de datos (esto también eliminará las imágenes de galería por CASCADE)
  const { error } = await supabase.from("artworks").delete().eq("id", id)

  if (error) {
    console.error("Error deleting artwork:", error)
    throw new Error("Error al eliminar la obra.")
  }

  revalidatePath("/admin/obras")
  revalidatePath("/obras")
  revalidatePath("/")
}
