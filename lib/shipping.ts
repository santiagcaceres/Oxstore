export interface ShippingMethod {
  id: string
  name: string
  logoUrl: string
  description: string
  cost: number
}

export const shippingMethods: ShippingMethod[] = [
  {
    id: "dac",
    name: "DAC",
    logoUrl: "/placeholder.svg?width=100&height=40&text=DAC",
    description: "Entrega en 24-72hs hábiles a todo el país.",
    cost: 8,
  },
  {
    id: "ues",
    name: "UES",
    logoUrl: "/placeholder.svg?width=100&height=40&text=UES",
    description: "Entrega en 24-48hs hábiles en Montevideo y Canelones.",
    cost: 10,
  },
  {
    id: "el_correo",
    name: "El Correo",
    logoUrl: "/placeholder.svg?width=100&height=40&text=El+Correo",
    description: "Servicio estándar a nivel nacional.",
    cost: 7,
  },
  {
    id: "mirtrans",
    name: "Mirtrans",
    logoUrl: "/placeholder.svg?width=100&height=40&text=Mirtrans",
    description: "Especializado en paquetes grandes y envíos al interior.",
    cost: 12,
  },
]
