export interface Artwork {
  id: string
  title: string
  category: string
  subcategory?: string
  price: number
  description: string
  detailed_description?: string
  year?: number
  dimensions?: string
  technique?: string
  status: string
  featured: boolean
  main_image_url?: string
  gallery?: string[]
  created_at: string
}

export interface ArtworkFormData {
  title: string
  category: string
  subcategory?: string
  price: number
  description: string
  detailedDescription?: string
  year?: number
  dimensions?: string
  technique?: string
  status: string
  featured: boolean
}
