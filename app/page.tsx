import { getFeaturedArtworks } from "@/app/actions/artworks"
import HomePageClient from "./home-page-client"

export default async function HomePage() {
  try {
    const featuredArtworks = await getFeaturedArtworks()
    return <HomePageClient featuredArtworks={featuredArtworks} />
  } catch (error) {
    console.error("Error loading featured artworks:", error)
    // Fallback con obras de ejemplo si falla la conexión a Supabase
    const fallbackArtworks = [
      {
        id: "1",
        title: "Encuentro Dramático",
        category: "acrilicos",
        subcategory: "espatula",
        price: 2500,
        description: "Acrílico sobre lienzo, 50x70cm",
        detailed_description: "Una obra que explora las tensiones humanas a través del color y la forma.",
        main_image_url: "https://placehold.co/800x600/E9967A/FFFFFF/jpeg?text=Encuentro+Dramático",
        status: "Vendida",
        featured: true,
      },
      {
        id: "2",
        title: "Retrato Expresivo",
        category: "oleos",
        price: 1900,
        description: "Óleo sobre lienzo, 45x60cm",
        detailed_description: "Un retrato intenso que captura la vulnerabilidad humana.",
        main_image_url: "https://placehold.co/800x600/C8A2C8/FFFFFF/jpeg?text=Retrato+Expresivo",
        status: "Disponible",
        featured: true,
      },
      {
        id: "3",
        title: "Acuarela Vibrante",
        category: "acuarelas",
        price: 850,
        description: "Acuarela sobre papel, 30x40cm",
        detailed_description: "Una explosión de color y emoción capturada en acuarela.",
        main_image_url: "https://placehold.co/800x600/7FFFD4/000000/jpeg?text=Acuarela+Vibrante",
        status: "Disponible",
        featured: true,
      },
    ]
    return <HomePageClient featuredArtworks={fallbackArtworks} />
  }
}
