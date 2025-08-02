export interface Product {
  id: string
  title: string
  description: string
  handle: string
  images: {
    url: string
    altText: string
  }[]
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  tags: string[]
  createdAt: string
  collections: {
    handle: string
    title: string
  }[]
}

export interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
  image: string
}

export async function shopifyFetch({ query, variables }: { query: string; variables?: any }) {
  const endpoint = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`
  const key = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN

  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": key!,
      },
      body: JSON.stringify({ query, variables }),
    })

    return await result.json()
  } catch (error) {
    console.error("Shopify fetch error:", error)
    return null
  }
}

export const GET_PRODUCTS_QUERY = `
  query getProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          description
          handle
          createdAt
          tags
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          collections(first: 5) {
            edges {
              node {
                handle
                title
              }
            }
          }
        }
      }
    }
  }
`
