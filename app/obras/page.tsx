import { getArtworks } from "@/app/actions/artworks"
import ObrasClientPage from "./obras-client-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Todas las Obras",
  description:
    "Explora la colección completa de obras de Luciano Fulco: óleos, óleo pastel, acrílicos, acuarelas y dibujos. Arte simbólico uruguayo.",
  openGraph: {
    title: "Todas las Obras | Luciano Fulco",
    description:
      "Explora la colección completa de obras de Luciano Fulco: óleos, óleo pastel, acrílicos, acuarelas y dibujos.",
  },
}

const categories = [
  { id: "todos", name: "Todas las Obras" },
  { id: "oleos", name: "Óleos" },
  { id: "oleo-pastel", name: "Óleo Pastel" },
  { id: "acrilicos", name: "Acrílicos" },
  { id: "acuarelas", name: "Acuarelas" },
  { id: "dibujos", name: "Dibujos" },
  { id: "otros", name: "Otros" },
]

const sortOptions = [
  { id: "default", name: "Orden por Defecto" },
  { id: "price-asc", name: "Menor Precio" },
  { id: "price-desc", name: "Mayor Precio" },
]

export default async function ObrasPage() {
  try {
    const artworks = await getArtworks()
    return <ObrasClientPage artworks={artworks} categories={categories} sortOptions={sortOptions} />
  } catch (error) {
    console.error("Error loading artworks:", error)
    // Fallback con obras de ejemplo
    const fallbackArtworks = [
      {
        id: "1",
        title: "Encuentro Dramático",
        category: "acrilicos",
        subcategory: "espatula",
        price: 2500,
        description: "Acrílico sobre lienzo, 50x70cm",
        main_image_url: "https://placehold.co/800x600/E9967A/FFFFFF/jpeg?text=Encuentro+Dramático",
        status: "Vendida",
      },
      {
        id: "2",
        title: "Retrato Expresivo",
        category: "oleos",
        price: 1900,
        description: "Óleo sobre lienzo, 45x60cm",
        main_image_url: "https://placehold.co/800x600/C8A2C8/FFFFFF/jpeg?text=Retrato+Expresivo",
        status: "Disponible",
      },
      {
        id: "3",
        title: "Acuarela Vibrante",
        category: "acuarelas",
        price: 850,
        description: "Acuarela sobre papel, 30x40cm",
        main_image_url: "https://placehold.co/800x600/7FFFD4/000000/jpeg?text=Acuarela+Vibrante",
        status: "Disponible",
      },
    ]
    return <ObrasClientPage artworks={fallbackArtworks} categories={categories} sortOptions={sortOptions} />
  }
}
