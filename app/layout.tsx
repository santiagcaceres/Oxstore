import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import GoogleAnalytics from "@/components/google-analytics"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
})

// Timestamp para forzar actualización de caché
const CACHE_BUSTER = Date.now()

export const metadata: Metadata = {
  title: {
    default: "Luciano Fulco - Artista Visual Uruguayo",
    template: "%s | Luciano Fulco",
  },
  description:
    "Portfolio oficial de Luciano Fulco, artista visual uruguayo. Descubre obras únicas en acrílico, óleo, acuarela, dibujo y esculturas. Arte simbólico desde Santa Lucía, Uruguay.",
  keywords: [
    "Luciano Fulco",
    "artista uruguayo",
    "pintura",
    "arte visual",
    "acrílico",
    "óleo",
    "óleo pastel",
    "acuarela",
    "esculturas",
    "Santa Lucía",
    "Uruguay",
    "arte contemporáneo",
    "pintura simbólica",
  ],
  authors: [{ name: "Luciano Fulco" }],
  creator: "Luciano Fulco",
  publisher: "LaunchByte",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_UY",
    url: "https://lucianofulco.com",
    siteName: "Luciano Fulco - Artista Visual",
    title: "Luciano Fulco - Artista Visual Uruguayo",
    description:
      "Portfolio oficial de Luciano Fulco, artista visual uruguayo. Arte simbólico desde Santa Lucía, Uruguay.",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Luciano Fulco - Artista Visual Uruguayo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luciano Fulco - Artista Visual Uruguayo",
    description:
      "Portfolio oficial de Luciano Fulco, artista visual uruguayo. Arte simbólico desde Santa Lucía, Uruguay.",
    images: ["/icon.png"],
  },
  icons: {
    icon: [
      { url: `/favicon.ico?t=${CACHE_BUSTER}`, type: "image/x-icon" },
      { url: `/icon.png?t=${CACHE_BUSTER}`, sizes: "any", type: "image/png" },
    ],
    apple: [{ url: `/app-icon.png?t=${CACHE_BUSTER}`, sizes: "180x180", type: "image/png" }],
  },
  manifest: `/site.webmanifest?t=${CACHE_BUSTER}`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Luciano Fulco",
  },
  metadataBase: new URL("https://lucianofulco.com"),
  other: {
    "mobile-web-app-capable": "yes",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cacheBuster = Date.now()

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* CRITICAL: Cache busting con timestamp dinámico */}
        <link rel="icon" href={`/favicon.ico?t=${cacheBuster}`} type="image/x-icon" />
        <link rel="shortcut icon" href={`/favicon.ico?t=${cacheBuster}`} />

        {/* Nuevo nombre de archivo para forzar descarga */}
        <link rel="icon" type="image/png" href={`/icon.png?t=${cacheBuster}`} />

        {/* Apple - Nuevo nombre de archivo app-icon.png */}
        <link rel="apple-touch-icon" href={`/app-icon.png?t=${cacheBuster}`} />
        <link rel="apple-touch-icon-precomposed" href={`/app-icon.png?t=${cacheBuster}`} />

        {/* Meta tags Apple */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Luciano Fulco" />

        {/* Forzar recarga */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />

        {/* Android/Chrome */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />

        {/* Manifest con cache busting */}
        <link rel="manifest" href={`/site.webmanifest?t=${cacheBuster}`} />

        {/* Preload con cache busting */}
        <link rel="preload" href={`/app-icon.png?t=${cacheBuster}`} as="image" type="image/png" />
      </head>
      <body className={`${inter.variable} ${playfairDisplay.variable} font-sans`}>
        <Suspense>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
            {children}
            <Toaster />
            <Analytics />
            <GoogleAnalytics />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
