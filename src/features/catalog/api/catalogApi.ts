import { apiClient } from '../../../shared/api/apiClient'
import { CATALOG_CATEGORY_SLUG } from '../catalogConfig'

export type FilterOption = {
  value: string
  label: string
}

export type CategoryFilter = {
  key: string
  label: string
  type: 'checkbox' | 'radio' | 'color' | 'range'
  options?: FilterOption[]
  min?: number
  max?: number
  unit?: string
}

export type Category = {
  id: string
  slug: string
  name: string
  nameEn: string
  description: string
  image: string
  productsCount: number
  filters: CategoryFilter[]
}

export type Product = {
  id: string
  slug: string
  title: string
  brand?: string
  description?: string
  image?: string
  price: number
  oldPrice?: number | null
  discountPercent?: number | null
  rating?: number
  reviewsCount?: number
  inStock?: boolean
}

export type ProductsResponse = {
  items: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
  sort: string
}

export type ProductDetails = Product & {
  images?: string[]
  specs?: Record<string, string | number | boolean>
  warrantyMonths?: number
  related?: Product[]
}

export type GetProductsParams = {
  sort?: string
  page?: number
  limit?: number
  q?: string
  minPrice?: number
  maxPrice?: number
  filters?: Record<string, string>
  signal?: AbortSignal
}

export function getCatalogCategory() {
  return apiClient<Category>(
    `/categories/${CATALOG_CATEGORY_SLUG}`,
    {
      withAuth: false,
    },
  )
}

export function getProducts({
  sort = 'newest',
  page = 1,
  limit = 12,
  q,
  minPrice,
  maxPrice,
  filters = {},
  signal,
}: GetProductsParams = {}) {
  const params = new URLSearchParams()

  params.set('category', CATALOG_CATEGORY_SLUG)
  params.set('sort', sort)
  params.set('page', String(page))
  params.set('limit', String(limit))

  if (q?.trim()) {
    params.set('q', q.trim())
  }

  if (minPrice !== undefined) {
    params.set('minPrice', String(minPrice))
  }

  if (maxPrice !== undefined) {
    params.set('maxPrice', String(maxPrice))
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value)
    }
  })

  return apiClient<ProductsResponse>(
    `/products?${params.toString()}`,
    {
      withAuth: false,
      signal,
    },
  )
}

export function getProductBySlug(slug: string) {
  return apiClient<ProductDetails>(
    `/products/${slug}`,
    {
      withAuth: false,
    },
  )
} 