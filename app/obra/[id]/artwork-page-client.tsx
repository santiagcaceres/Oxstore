"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Calendar, Palette, Ruler, MessageCircle, Award } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import ArtworkGallery from "./artwork-gallery"
import { trackArtworkView, trackContactClick, trackArtworkInquiry } from "@/lib/gtag"

interface ArtworkPageClientProps {
  artwork: any
  relatedArtworks: any[]
  galleryImages: string[]
}

export default function ArtworkPageClient({ artwork, relatedArtworks, galleryImages }: ArtworkPageClientProps) {
  // Track artwork view when component mounts
  useEffect(() => {
    trackArtworkView(artwork.id, artwork.title)
  }, [artwork.id, artwork.title])

  const handleEmailClick = () => {
    trackContactClick("email", artwork.title)
    trackArtworkInquiry(artwork.title, "email")
  }

  const handleWhatsAppClick = () => {
    trackContactClick("whatsapp", artwork.title)
    trackArtworkInquiry(artwork.title, "whatsapp")
  }

  return (
    <div className="min-h-screen relative">
      {/* Fondo artístico global */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-24 h-24 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-yellow-200/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-purple-200/25 rounded-full blur-lg animate-pulse delay-500"></div>
      </div>

      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-6">
            <Link href="/obras" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Volver</span>
            </Link>
            <div className="flex-1 flex justify-center">
              <Link href="/">
                <Image
                  src="/images/negro-lucho.png"
                  alt="Fulco Logo"
                  width={120}
                  height={60}
                  className="h-8 md:h-10 w-auto"
                />
              </Link>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          <div className="w-full">
            {/* Galería de imágenes con navegación - SIN SPACE-Y */}
            <ArtworkGallery images={galleryImages} title={artwork.title} />

            <div className="flex gap-2 mt-4">
              <Badge className="capitalize text-xs md:text-sm">{artwork.category}</Badge>
              {artwork.subcategory && (
                <Badge variant="outline" className="capitalize bg-white/90 text-xs md:text-sm">
                  {artwork.subcategory}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">{artwork.title}</h1>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">USD {artwork.price}</p>
            </div>

            <Card className="bg-white/90 backdrop-blur-sm border border-white/20">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">Detalles Técnicos</h3>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Calendar className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                    <span className="text-sm md:text-base text-gray-600">Año: {artwork.year}</span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <Ruler className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                    <span className="text-sm md:text-base text-gray-600">Dimensiones: {artwork.dimensions}</span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <Palette className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                    <span className="text-sm md:text-base text-gray-600">Técnica: {artwork.technique}</span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        artwork.status === "Disponible" ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <span className="text-sm md:text-base text-gray-600">Estado: {artwork.status}</span>
                    {artwork.status === "Vendida" && (
                      <div className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs ml-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        Vendida
                      </div>
                    )}
                  </div>
                  {/* Certificado de Autenticidad */}
                  <div className="flex items-center gap-2 md:gap-3 pt-2 border-t border-gray-200">
                    <Award className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                    <span className="text-sm md:text-base text-gray-600">
                      <span className="font-medium text-amber-700">Certificado de Autenticidad:</span> Obra original
                      realizada por Luciano Fulco
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* MOSTRAR AMBAS DESCRIPCIONES */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg space-y-4">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Sobre esta obra</h3>

              {/* Descripción corta */}
              {artwork.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Descripción</h4>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">{artwork.description}</p>
                </div>
              )}

              {/* Descripción detallada */}
              {artwork.detailed_description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Descripción Detallada</h4>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">{artwork.detailed_description}</p>
                </div>
              )}

              {/* Si no hay ninguna descripción */}
              {!artwork.description && !artwork.detailed_description && (
                <p className="text-sm md:text-base text-gray-500 italic">
                  No hay descripción disponible para esta obra.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white/90 backdrop-blur-sm border border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="mb-4">
                    <Image
                      src="/images/mailboxes-logo.png"
                      alt="Mail Boxes Etc"
                      width={160}
                      height={60}
                      className="mx-auto h-12 md:h-14 w-auto"
                    />
                  </div>
                  <p className="text-xs text-gray-600">Enviamos a Uruguay y todo el mundo</p>
                </CardContent>
              </Card>
              <Card className="bg-white/90 backdrop-blur-sm border border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="space-y-3 mb-3">
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <Image src="/images/prex-logo.png" alt="Prex" width={50} height={20} className="h-4 w-auto" />
                      <Image src="/images/paypal-logo.png" alt="PayPal" width={60} height={20} className="h-4 w-auto" />
                      <Image
                        src="/images/mercadopago-logo.png"
                        alt="Mercado Pago"
                        width={70}
                        height={20}
                        className="h-4 w-auto"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">Prex, PayPal, Mercado Pago y Transferencia</p>
                  <p className="text-xs text-green-600 font-medium">🎯 Mercado Pago: Hasta 12 cuotas sin interés</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3 md:space-y-4 bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`mailto:luciano.fulco51@hotmail.com?subject=Consulta%20por%20obra%20'${encodeURIComponent(
                    artwork.title,
                  )}'&body=Hola,%20estoy%20interesado/a%20en%20la%20obra%20'${encodeURIComponent(
                    artwork.title,
                  )}'.%20Quisiera%20recibir%20más%20información.`}
                  className="flex-1"
                  onClick={handleEmailClick}
                >
                  <Button size="lg" className="w-full text-sm md:text-base bg-black hover:bg-gray-800 text-white">
                    <Mail className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Consultar por Email
                  </Button>
                </a>
                <a
                  href={`https://wa.me/59898059079?text=${encodeURIComponent(
                    `Hola, estoy interesado/a en la obra '${artwork.title}'.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                  onClick={handleWhatsAppClick}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full text-sm md:text-base bg-white/80 backdrop-blur-sm border-black text-black hover:bg-black hover:text-white"
                  >
                    <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    WhatsApp
                  </Button>
                </a>
              </div>
              <p className="text-xs md:text-sm text-gray-500 text-center">
                Te responderé en menos de 24 horas con información sobre disponibilidad y envío.
              </p>
            </div>
          </div>
        </div>

        {relatedArtworks.length > 0 && (
          <div className="mt-12 md:mt-16">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8">
              Otras obras que podrían interesarte
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {relatedArtworks.map((relatedArt) => (
                <Link key={relatedArt.id} href={`/obra/${relatedArt.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white/90 backdrop-blur-sm border border-white/20">
                    <Image
                      src={
                        relatedArt.main_image_url ||
                        `https://placehold.co/400x300/E5E7EB/374151/jpeg?text=${encodeURIComponent(relatedArt.title) || "/placeholder.svg"}`
                      }
                      alt={relatedArt.title}
                      width={400}
                      height={300}
                      className="w-full h-32 md:h-48 object-cover"
                    />
                    <CardContent className="p-3 md:p-4">
                      <h4 className="text-sm md:text-base font-semibold text-gray-900">{relatedArt.title}</h4>
                      <p className="text-xs md:text-sm text-gray-600">{relatedArt.description}</p>
                      <p className="text-base md:text-lg font-bold text-gray-900 mt-1 md:mt-2">
                        USD {relatedArt.price}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
