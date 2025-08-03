import type { Product, ProductVariant, ProductOption } from "./types"

function determineGender(zureoProduct: any): string {
  // Implement gender determination logic here
  return "Unspecified"
}

export function transformZureoProduct(zureoProduct: any, imageData?: any): Product {
  // Validación básica
  if (!zureoProduct) {
    throw new Error("Producto de Zureo no válido")
  }

  // Procesar imágenes de manera segura
  let images: string[] = ["/placeholder.svg?height=400&width=400"]

  if (imageData?.images && Array.isArray(imageData.images)) {
    const validImages = imageData.images
      .filter((img: any) => img?.imagen && typeof img.imagen === "string")
      .map((img: any) => `data:image/jpeg;base64,${img.imagen}`)

    if (validImages.length > 0) {
      images = validImages
    }
  }

  // Procesar variantes de manera segura
  const variants: ProductVariant[] = []

  if (zureoProduct.variantes && Array.isArray(zureoProduct.variantes)) {
    zureoProduct.variantes.forEach((variant: any) => {
      if (variant && typeof variant === "object") {
        variants.push({
          id: String(variant.id || Math.random()),
          title: variant.nombre || variant.title || "Variante",
          price: Number.parseFloat(variant.precio || zureoProduct.precio || "0"),
          compareAtPrice: variant.precio_comparacion ? Number.parseFloat(variant.precio_comparacion) : undefined,
          availableForSale: (variant.stock || 0) > 0,
          quantityAvailable: Number.parseInt(variant.stock || "0"),
          selectedOptions: [
            {
              name: "Talle",
              value: variant.talle || "Único",
            },
            {
              name: "Color",
              value: variant.color || "Único",
            },
          ],
        })
      }
    })
  }

  // Si no hay variantes, crear una por defecto
  if (variants.length === 0) {
    variants.push({
      id: String(zureoProduct.id || Math.random()),
      title: "Default",
      price: Number.parseFloat(zureoProduct.precio || "0"),
      compareAtPrice: zureoProduct.precio_comparacion ? Number.parseFloat(zureoProduct.precio_comparacion) : undefined,
      availableForSale: (zureoProduct.stock || 0) > 0,
      quantityAvailable: Number.parseInt(zureoProduct.stock || "0"),
      selectedOptions: [
        { name: "Talle", value: "Único" },
        { name: "Color", value: "Único" },
      ],
    })
  }

  // Procesar opciones de manera segura
  const options: ProductOption[] = [
    {
      id: "talle",
      name: "Talle",
      values: [...new Set(variants.map((v) => v.selectedOptions.find((o) => o.name === "Talle")?.value || "Único"))],
    },
    {
      id: "color",
      name: "Color",
      values: [...new Set(variants.map((v) => v.selectedOptions.find((o) => o.name === "Color")?.value || "Único"))],
    },
  ]

  // Construir el producto transformado
  return {
    id: String(zureoProduct.id || Math.random()),
    handle: zureoProduct.codigo || String(zureoProduct.id || Math.random()),
    availableForSale: variants.some((v) => v.availableForSale),
    title: zureoProduct.nombre || "Producto sin nombre",
    description: zureoProduct.descripcion_larga || zureoProduct.descripcion || "Sin descripción disponible",
    descriptionHtml: `<p>${zureoProduct.descripcion_larga || zureoProduct.descripcion || "Sin descripción disponible"}</p>`,
    options,
    priceRange: {
      maxVariantPrice: {
        amount: String(Math.max(...variants.map((v) => v.price))),
        currencyCode: "ARS",
      },
      minVariantPrice: {
        amount: String(Math.min(...variants.map((v) => v.price))),
        currencyCode: "ARS",
      },
    },
    variants: {
      edges: variants.map((variant) => ({
        node: variant,
      })),
    },
    featuredImage: {
      url: images[0],
      altText: zureoProduct.nombre || "Imagen del producto",
      width: 400,
      height: 400,
    },
    images: {
      edges: images.map((url, index) => ({
        node: {
          url,
          altText: `${zureoProduct.nombre || "Producto"} - Imagen ${index + 1}`,
          width: 400,
          height: 400,
        },
      })),
    },
    seo: {
      title: zureoProduct.nombre || "Producto",
      description: zureoProduct.descripcion || "Producto disponible en nuestra tienda",
    },
    tags: [zureoProduct.marca?.nombre, zureoProduct.tipo?.nombre, zureoProduct.categoria?.nombre].filter(Boolean),
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    // Campos adicionales de Zureo
    brand: zureoProduct.marca?.nombre || "Sin marca",
    category: zureoProduct.tipo?.nombre || zureoProduct.categoria?.nombre || "Sin categoría",
    gender: determineGender(zureoProduct),
    stock: variants.reduce((total, variant) => total + variant.quantityAvailable, 0),
  }
}
