import { getProducts, type GetProductsParams, type Product, type ProductsResponse } from '../../features/catalog/api/catalogApi'

/** All six visual cards and footer navigation use a dedicated `type` URL parameter.
 * The API's category is currently only `furniture`; it is not one of these six types.
 */
export const furnitureCategories = [
  { name: 'დივანი', icon: 'sofa.svg', query: 'sofa' },
  { name: 'სავარძელი', icon: 'armchair.svg', query: 'armchair' },
  { name: 'მაგიდა', icon: 'table.svg', query: 'table' },
  { name: 'სკამი', icon: 'chair.svg', query: 'chair' },
  { name: 'კარადა', icon: 'wardrobe.svg', query: 'wardrobe' },
  { name: 'საწოლი', icon: 'bed.svg', query: 'bed' },
] as const

export type FurnitureType = (typeof furnitureCategories)[number]['query']

export function getFurnitureCategory(value: string | null) {
  return furnitureCategories.find((item) => item.query === value)
}

export function categoryCatalogUrl(type: FurnitureType | string) {
  return `/catalog?type=${encodeURIComponent(type)}&page=1`
}

/** Title and slug are the product-level classification information exposed
 * by the current furniture listing API. Word boundaries matter: "chair" must
 * NOT return "armchair". English, Georgian and Russian names are supported.
 */
const matches: Record<FurnitureType, RegExp> = {
  sofa: /(?:^|[^a-z])(?:sofas?|couches?|settees?|loveseats?)(?=$|[^a-z])|დივან|диван/i,
  armchair: /(?:^|[^a-z])(?:armchairs?|arm[- ]chairs?|recliners?|lounge[- ]chairs?|accent[- ]chairs?)(?=$|[^a-z])|სავარძელ|кресл/i,
  table: /(?:^|[^a-z])(?:tables?)(?=$|[^a-z])|მაგიდ|стол/i,
  chair: /(?:^|[^a-z])(?:chairs?|stools?)(?=$|[^a-z])|სკამ|стул/i,
  wardrobe: /(?:^|[^a-z])(?:wardrobes?|armoires?|closets?|cabinets?)(?=$|[^a-z])|კარად|шкаф|гардероб/i,
  bed: /(?:^|[^a-z])(?:beds?|bedframes?)(?=$|[^a-z])|საწოლ|кроват/i,
}

export function matchesFurnitureType(product: Product, type: FurnitureType) {
  // Type is taken from the title or slug, not the brand or general description.
  const title = `${product.title ?? ''} ${product.slug ?? ''}`
  const isArmchair = matches.armchair.test(title)
  if (type === 'chair' && isArmchair) return false
  if (type === 'armchair') return isArmchair
  return matches[type].test(title)
}

/** The API lists all brands together, paginated. To return a complete type
 * result, read all matching furniture pages, filter by product title/slug,
 * then paginate locally. A hard safety cap fails explicitly, never shows a
 * silently incomplete result. The other catalogue search/filter UI is intact.
 */
export async function fetchProductsForFurnitureType(
  type: FurnitureType,
  { page = 1, limit = 12, signal, ...rest }: GetProductsParams = {},
): Promise<ProductsResponse> {
  const perRequest = 100
  const first = await getProducts({ ...rest, page: 1, limit: perRequest, signal })
  const allProducts = [...first.items]
  const maxRequests = 250
  if (first.totalPages > maxRequests) {
    throw new Error('The furniture catalogue exceeds the supported number of pages')
  }

  for (let nextPage = 2; nextPage <= first.totalPages; nextPage += 1) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    const response = await getProducts({ ...rest, page: nextPage, limit: perRequest, signal })
    allProducts.push(...response.items)
  }

  // Preserve server sorting and remove repeats, should the API have shifting pages.
  const seen = new Set<string>()
  const matching = allProducts.filter((item) => {
    if (seen.has(item.id) || !matchesFurnitureType(item, type)) return false
    seen.add(item.id)
    return true
  })
  const safeLimit = limit > 0 ? limit : 12
  const safePage = page > 0 ? page : 1
  const total = matching.length
  return {
    ...first,
    items: matching.slice((safePage - 1) * safeLimit, safePage * safeLimit),
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
  }
}
