export interface ApiProduct {
  id: string
  name: string
  price: number
  stock: number
  sku: string
  category: string
  images: string[]
}

export interface StockUpdate {
  sku: string
  quantity: number
}

export { zureoAPI as oxstoreAPI, zureoAPI } from "./zureo-api"
export type { ZureoProduct, ZureoBrand, ZureoProductType } from "./zureo-api"
