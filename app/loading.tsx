import Image from "next/image"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Image
          src="/images/negro-lucho.png"
          alt="Fulco Logo"
          width={120}
          height={60}
          className="h-10 w-auto mx-auto mb-6 animate-pulse"
        />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}
