import { Product } from '../types/types'

export interface FetchParams {
  categories?: string[]
  limit?: number
  skip?: number
  search?: string
  signal?: AbortSignal
  revalidate?: number
}

export async function fetchProducts(
  params: FetchParams
): Promise<{ products: Product[]; total: number }> {

  const BASE_URL = 'https://dummyjson.com/products'

  const limit = params.limit ?? 20
  const skip = params.skip ?? 0
  const search = params.search?.trim()
  const category = params.categories?.[0]

  let url: URL

  if (search) {
    url = new URL(`${BASE_URL}/search`)
    url.searchParams.set('q', search)
  }

  else if (category) {url = new URL(`${BASE_URL}/category/${category}`)}

  else {url = new URL(BASE_URL)}

  url.searchParams.set('limit', String(limit))
  url.searchParams.set('skip', String(skip))

  const response = await fetch(url.toString(), {signal: params.signal})

  if (!response.ok) {throw new Error(`Fetch failed: ${response.status}`)}

  const data = await response.json()

  return {
    products: data.products ?? [],
    total: data.total ?? 0
  }
}
