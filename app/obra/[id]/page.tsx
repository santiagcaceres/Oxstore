import { notFound } from "next/navigation"
import { getArtworkById, getArtworks } from "@/app/actions/artworks"
import type { Metadata } from "next"
import ArtworkPageClient from "./artwork-page-client"

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const artwork = await getArtworkById(params.id)

  if (!artwork) {
    return {
      title: "Obra no encontrada",
    }
  }

  return {
    title: artwork.title,
    description: `${artwork.description} - ${artwork.detailed_description || "Obra de Luciano Fulco, artista visual uruguayo."}`,
    openGraph: {
      title: `${artwork.title} | Luciano Fulco`,
      description: artwork.description,
      images: artwork.main_image_url ? [artwork.main_image_url] : [],
    },
  }
}

export default async function ArtworkDetailPage({ params }: PageProps) {
  const artwork = await getArtworkById(params.id)
  if (!artwork) {
    notFound()
  }

  const allArtworks = await getArtworks()
  const relatedArtworks = allArtworks
    .filter((art) => art.id !== artwork.id && art.category === artwork.category)
    .slice(0, 3)

  // Usar directamente el array de gallery que ya contiene todas las imágenes
  const galleryImages = artwork.gallery || []

  return <ArtworkPageClient artwork={artwork} relatedArtworks={relatedArtworks} galleryImages={galleryImages} />
}
