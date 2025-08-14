import Image from "next/image"
import Link from "next/link"

interface Banner {
  id: string
  title: string
  description?: string
  image_url: string
  link_url?: string
  banner_type: string
  banner_size: string
  display_order: number
}

interface BannerGridProps {
  banners: Banner[]
  type: "category" | "promotional" | "product"
}

export default function BannerGrid({ banners, type }: BannerGridProps) {
  if (banners.length === 0) return null

  const getGridClasses = () => {
    switch (type) {
      case "category":
        return "grid grid-cols-2 md:grid-cols-4 gap-3 px-4"
      case "promotional":
        return "grid grid-cols-1 md:grid-cols-3 gap-6"
      case "product":
        return "grid grid-cols-1 md:grid-cols-2 gap-6"
      default:
        return "grid grid-cols-1 gap-4"
    }
  }

  const getItemClasses = (banner: Banner) => {
    switch (banner.banner_size) {
      case "square":
        return type === "category" ? "aspect-[4/5.5]" : "aspect-square"
      case "small":
        return "aspect-[3/2]"
      case "medium":
        return type === "promotional" ? "aspect-[3/2]" : "aspect-[4/3]"
      case "large":
        return "aspect-[16/9]"
      default:
        return "aspect-[16/9]"
    }
  }

  return (
    <div className={`w-full ${getGridClasses()}`}>
      {banners.map((banner) => (
        <div key={banner.id} className={`relative overflow-hidden rounded-lg ${getItemClasses(banner)}`}>
          {banner.link_url ? (
            <Link href={banner.link_url} className="block w-full h-full group">
              <Image
                src={banner.image_url || "/placeholder.svg"}
                alt={banner.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Overlay con título */}
              {banner.title && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white text-xl font-bold text-center px-4">{banner.title}</h3>
                </div>
              )}
            </Link>
          ) : (
            <div className="w-full h-full relative">
              <Image src={banner.image_url || "/placeholder.svg"} alt={banner.title} fill className="object-cover" />
              {banner.title && (
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-end">
                  <div className="p-4 text-white">
                    <h3 className="text-lg font-bold">{banner.title}</h3>
                    {banner.description && <p className="text-sm opacity-90">{banner.description}</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
