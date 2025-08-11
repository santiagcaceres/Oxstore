// Datos específicos de Uruguay
export const URUGUAY_DEPARTMENTS = [
  "Montevideo",
  "Canelones",
  "San José",
  "Colonia",
  "Soriano",
  "Río Negro",
  "Paysandú",
  "Salto",
  "Artigas",
  "Rivera",
  "Tacuarembó",
  "Durazno",
  "Flores",
  "Florida",
  "Lavalleja",
  "Treinta y Tres",
  "Cerro Largo",
  "Rocha",
  "Maldonado",
]

export const DOCUMENT_TYPES = [
  { value: "CI", label: "Cédula de Identidad" },
  { value: "Pasaporte", label: "Pasaporte" },
]

export const PAYMENT_METHODS = [
  { value: "mercadopago", label: "MercadoPago" },
  { value: "transferencia", label: "Transferencia Bancaria" },
  { value: "efectivo", label: "Efectivo (Contra Entrega)" },
]

export const SHIPPING_METHODS = [
  { value: "standard", label: "Envío Estándar (3-5 días hábiles)" },
  { value: "express", label: "Envío Express (1-2 días hábiles)" },
  { value: "pickup", label: "Retiro en Local" },
]

// Función para formatear precios en pesos uruguayos
export function formatUYUPrice(price: number): string {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Función para calcular costo de envío
export function calculateShippingCost(department: string, method: "standard" | "express", orderTotal: number): number {
  const shippingRates: Record<string, { standard: number; express: number; freeThreshold: number }> = {
    Montevideo: { standard: 150, express: 300, freeThreshold: 2000 },
    Canelones: { standard: 200, express: 400, freeThreshold: 2000 },
    "San José": { standard: 250, express: 500, freeThreshold: 2000 },
    Colonia: { standard: 300, express: 600, freeThreshold: 2000 },
    Soriano: { standard: 350, express: 700, freeThreshold: 2000 },
    "Río Negro": { standard: 350, express: 700, freeThreshold: 2000 },
    Paysandú: { standard: 400, express: 800, freeThreshold: 2000 },
    Salto: { standard: 450, express: 900, freeThreshold: 2000 },
    Artigas: { standard: 500, express: 1000, freeThreshold: 2000 },
    Rivera: { standard: 450, express: 900, freeThreshold: 2000 },
    Tacuarembó: { standard: 400, express: 800, freeThreshold: 2000 },
    Durazno: { standard: 300, express: 600, freeThreshold: 2000 },
    Flores: { standard: 350, express: 700, freeThreshold: 2000 },
    Florida: { standard: 250, express: 500, freeThreshold: 2000 },
    Lavalleja: { standard: 300, express: 600, freeThreshold: 2000 },
    "Treinta y Tres": { standard: 350, express: 700, freeThreshold: 2000 },
    "Cerro Largo": { standard: 400, express: 800, freeThreshold: 2000 },
    Rocha: { standard: 350, express: 700, freeThreshold: 2000 },
    Maldonado: { standard: 250, express: 500, freeThreshold: 2000 },
  }

  const rates = shippingRates[department]
  if (!rates) return 0

  // Envío gratis si supera el umbral
  if (orderTotal >= rates.freeThreshold) return 0

  return method === "express" ? rates.express : rates.standard
}
