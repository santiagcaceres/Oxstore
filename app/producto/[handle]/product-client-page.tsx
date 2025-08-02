"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Star, Heart, ShoppingCart, Minus, Plus, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/context/cart-context"
import AddToCartPopup from "@/components/add-to-cart-popup"
import SubtleWarning from "@/components/subtle-warning"

// Este componente recibe el producto ya procesado\
export default function ProductClientPage(\{ product \}: \{ product: any \})
\
{
  const router = useRouter()\
  const \{ dispatch \} = useCart()

  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "")
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || "")
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showPopup, setShowPopup] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState("")
\
  useEffect(() => \
    setSelectedSize(product.sizes?.[0] || "")
    setSelectedColor(product.colors?.[0]?.name || "")
    setSelectedImage(0)
    setQuantity(1)\
  \, [product])
\
  const handleAddToCart = () => \{
    const missingSelections = []
    if (product.sizes.length > 0 && !selectedSize) missingSelections.push("talla")
    if (product.colors.length > 0 && !selectedColor) missingSelections.push("color")

    if (missingSelections.length > 0) \{
      const message = `Por favor selecciona $\{missingSelections.join(" y ")\}.`
      setWarningMessage(message)
      setShowWarning(true)
      return
    \}
\
    const cartItem = \
      id: `$\{product.id\}-$\{selectedSize\}-$\{selectedColor\}`,\
      title: `$\{product.title\} $\{selectedSize ? `- $\selectedSize\` : ""\} $\{
        selectedColor ? `- $\selectedColor\` : ""
      \}`,\
      price: product.price,
      quantity,\
      image: product.images[0],\
      handle: product.handle,
    \
\
    dispatch(\type: "ADD_ITEM\", payload: cartItem \})
    setShowPopup(true)
  \

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"\
            onClick=\{() => router.back()\}
            className="p-0 h-auto text-gray-600 hover:text-blue-950"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          \{/* Galería de imágenes */\}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={product.images[selectedImage] || "/placeholder.svg"}\
                alt=\{product.title\}
                width=\{600\}
                height=\{600\}
                className="w-full h-full object-cover"
                unoptimized // Necesario si las imágenes son base64
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              \{product.images.map((image: string, index: number) => (
                <button\
                  key=\{index\}
                  onClick=\{() => setSelectedImage(index)\}
                  className=\{`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors $\{
                    selectedImage === index ? "border-blue-950" : "border-transparent"
                  \}`\}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt=\{\`$\{product.title\} $\{index + 1\}`\}
                    width=\{200\}
                    height=\{200\}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </button>
              ))\}
            </div>
          </div>

          \{/* Información del producto */\}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                \{product.inStock ? (
                  <Badge className="bg-green-100 text-green-800">En Stock</Badge>
                ) : (
                  <Badge variant="secondary">Agotado</Badge>
                )\}
                \{discount > 0 && <Badge className="bg-red-100 text-red-800">-\{discount\}%</Badge>\}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">\{product.title\}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  \{[...Array(5)].map((_, i) => (
                    <Star\
                      key=\{i\}\
                      className=\{`h-4 w-4 $\{
                        i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                      \}`\}
                    />
                  ))\}
                </div>\
                <span className="text-sm text-gray-600">\
                  \{product.rating\} (\{product.reviewCount\} reseñas)\
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-blue-950">$\{product.price\}</span>
              \{product.compareAtPrice && (
                <span className="text-xl text-gray-500 line-through">$\{product.compareAtPrice\}</span>
              )\}
            </div>

            <p className="text-gray-600 leading-relaxed">\{product.description\}</p>

            \{/* Selección de talla */\}
            \{product.sizes.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-900 mb-3 block">Talla</label>
                <div className="flex flex-wrap gap-2">
                  \{product.sizes.map((size: string) => (
                    <button\
                      key=\{size\}
                      onClick=\{() => setSelectedSize(size)\}
                      className=\{`py-2 px-3 text-sm font-medium rounded-md border transition-colors $\{
                        selectedSize === size
                          ? "border-blue-950 bg-blue-950 text-white"
                          : "border-gray-300 bg-white text-gray-900 hover:border-gray-400"
                      \}`\}
                    >
                      \{size\}
                    </button>
                  ))\}
                </div>
              </div>
            )\}

            \{/* Selección de color */\}
            \{product.colors.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-900 mb-3 block">
                  Color: <span className="font-normal text-gray-600">\{selectedColor\}</span>
                </label>
                <div className="flex gap-3">
                  \{product.colors.map((color: any) => (
                    <button\
                      key=\{color.name\}
                      onClick=\{() => setSelectedColor(color.name)\}
                      className=\{`w-8 h-8 rounded-full border-2 transition-all $\{
                        selectedColor === color.name
                          ? "border-blue-950 scale-110"
                          : "border-gray-300 hover:border-gray-400"
                      \}`\}\
                      style=\{\{ backgroundColor: color.value \}\}
                      title=\{color.name\}
                    />
                  ))\}
                </div>
              </div>
            )\}

            \{/* Cantidad y Botones */\}
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-gray-900 mb-3 block">Cantidad</label>
                <div className="flex items-center gap-3">
                  <button\
                    onClick=\{() => setQuantity(Math.max(1, quantity - 1))\}
                    className="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">\{quantity\}</span>
                  <button\
                    onClick=\{() => setQuantity(quantity + 1)\}
                    className="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <Button\
                onClick=\{handleAddToCart\}
                disabled=\{!product.inStock\}
                className="w-full bg-blue-950 hover:bg-blue-900 text-white py-3"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                \{product.inStock ? "Agregar al Carrito" : "Agotado"\}
              </Button>

              <Button variant="outline" className="w-full bg-transparent" size="lg">
                <Heart className="h-5 w-5 mr-2" />
                Agregar a Favoritos
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AddToCartPopup\
        isVisible=\{showPopup\}
        onClose=\{() => setShowPopup(false)\}\
        product=\{\{ ...product, quantity, selectedSize, selectedColor \}\}
      />\
      <SubtleWarning message=\{warningMessage\} isVisible=\{showWarning\} onClose=\{() => setShowWarning(false)\} />
    </div>
  )
\}
