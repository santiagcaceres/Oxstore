export interface MercadoPagoItem {
  id: string
  title: string
  description?: string
  picture_url?: string
  category_id?: string
  quantity: number
  currency_id: "UYU"
  unit_price: number
}

export interface MercadoPagoPayer {
  name: string
  surname: string
  email: string
  phone?: {
    area_code?: string
    number: string
  }
  address?: {
    street_name: string
    street_number?: number
    zip_code: string
  }
}

export interface MercadoPagoPreference {
  items: MercadoPagoItem[]
  payer: MercadoPagoPayer
  back_urls: {
    success: string
    failure: string
    pending: string
  }
  auto_return: "approved"
  external_reference: string // Usaremos esto para nuestro ID de pedido
  notification_url?: string // Para webhooks en el futuro
}
