// Mock data for development - replace with actual Shopify integration
export interface Product {
  id: string
  title: string
  handle: string
  description: string
  images: { url: string; altText: string }[]
  variants: {
    id: string
    title: string
    price: { amount: string; currencyCode: string }
    availableForSale: boolean
  }[]
  tags: string[]
  vendor: string
  productType: string
  createdAt: string
  updatedAt: string
}

export interface Collection {
  id: string
  title: string
  handle: string
  description: string
  image?: { url: string; altText: string }
  products: Product[]
}

// Mock products data
const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Remera Básica Negra',
    handle: 'remera-basica-negra',
    description: 'Remera básica de algodón 100% en color negro. Perfecta para el día a día.',
    images: [
      { url: '/placeholder.svg?height=400&width=400&text=Remera+Negra', altText: 'Remera Básica Negra' }
    ],
    variants: [
      {
        id: '1-s',
        title: 'S',
        price: { amount: '2500', currencyCode: 'ARS' },
        availableForSale: true
      },
      {
        id: '1-m',
        title: 'M',
        price: { amount: '2500', currencyCode: 'ARS' },
        availableForSale: true
      },
      {
        id: '1-l',
        title: 'L',
        price: { amount: '2500', currencyCode: 'ARS' },
        availableForSale: true
      }
    ],
    tags: ['remera', 'básica', 'algodón'],
    vendor: 'OX Store',
    productType: 'Remera',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

export async function getProducts(): Promise<Product[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  return mockProducts
}

export async function getProduct(handle: string): Promise<Product | null> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return mockProducts.find(product => product.handle === handle) || null
}

export async function getCollections(): Promise<Collection[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return [
    {
      id: '1',
      title: 'Remeras',
      handle: 'remeras',
      description: 'Colección de remeras',
      products: mockProducts
    }
  ]
}
