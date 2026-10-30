import i18n from '../../shared/i18n/index'
import LocalizedText from '../../shared/i18n/LocalizedText'
import { localizedCatalogText } from '../../shared/i18n/productFields'
import { useTranslation as useAtelierTranslation } from 'react-i18next'

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
} from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'

import {
  getCatalogCategory,
  getProducts,
  type Category,
  type CategoryFilter,
  type Product,
} from '../../features/catalog/api/catalogApi'

import { useCart } from '../../features/cart/model/useCart'
import { AddToCartButton } from '../../features/cart/ui/AddToCartButton'

import { fetchProductsForFurnitureType, getFurnitureCategory } from '../../shared/data/furnitureCategories'

import './CatalogPage.css'

const RESERVED_PARAMS = new Set([
  'sort',
  'page',
  'q',
  'minPrice',
  'maxPrice',
  'type', // ATELIER's six visual types are client-side, not API filter keys
])

const COLOR_MAP: Record<string, string> = {
  natural: '#d9c3a5',
  white: '#ffffff',
  black: '#111111',
  grey: '#9ca3af',
  gray: '#9ca3af',
  brown: '#8b5e3c',
  blue: '#4f6fae',
  green: '#6f8f72',
  red: '#b85c5c',
  beige: '#d8c8ae',
}

// ========================================
// SKELETON CARDS
// ========================================

function ProductSkeletons() {
  useAtelierTranslation()
  return (
    <div
      className="product-grid"
      role="status"
      aria-label={i18n.t("auto.106")}
    >
      {Array.from({ length: 12 }, (_, index) => (
        <div
          key={index}
          className="product-card-skeleton"
          aria-hidden="true"
        >
          <div className="skeleton-image" />

          <div className="skeleton-content">
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-line--short" />
            <div className="skeleton-line skeleton-line--price" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ========================================
// SEARCH BOX
// ========================================

type SearchBoxProps = {
  initialValue: string
  onSearchChange: (value: string) => void
}

function SearchBox({
  initialValue,
  onSearchChange,
}: SearchBoxProps) {
  useAtelierTranslation()
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    if (value.trim() === initialValue) {
      return
    }

    const timer = window.setTimeout(() => {
      onSearchChange(value.trim())
    }, 400)

    return () => window.clearTimeout(timer)
  }, [value, initialValue, onSearchChange])

  return (
    <div className="catalog-search">
      <label htmlFor="catalog-search">
        <LocalizedText k="auto.107" /> </label>

      <input
        id="catalog-search"
        type="search"
        value={value}
        placeholder={i18n.t("auto.108")}
        onChange={(event) => {
          setValue(event.target.value)
        }}
      />
    </div>
  )
}

// ========================================
// PRICE RANGE
// ========================================

type PriceRangeProps = {
  filter: CategoryFilter
  minPrice: string
  maxPrice: string
  onPriceChange: (
    minValue: string,
    maxValue: string,
  ) => void
}

function PriceRange({
  filter,
  minPrice,
  maxPrice,
  onPriceChange,
}: PriceRangeProps) {
  useAtelierTranslation()
  const [minDraft, setMinDraft] = useState(minPrice)
  const [maxDraft, setMaxDraft] = useState(maxPrice)

  const lowerBound = filter.min ?? 0
  const upperBound = filter.max ?? lowerBound
  const unit = filter.unit ?? '₾'

  const hasSlider = upperBound > lowerBound

  const minNumber =
    minDraft !== '' &&
    Number.isFinite(Number(minDraft))
      ? Number(minDraft)
      : lowerBound

  const maxNumber =
    maxDraft !== '' &&
    Number.isFinite(Number(maxDraft))
      ? Number(maxDraft)
      : upperBound

  const invalidRange =
    minDraft !== '' &&
    maxDraft !== '' &&
    Number(minDraft) > Number(maxDraft)

  useEffect(() => {
    if (
      invalidRange ||
      (minDraft === minPrice && maxDraft === maxPrice)
    ) {
      return
    }

    const timer = window.setTimeout(() => {
      const normalize = (value: string) => {
        if (value.trim() === '') {
          return ''
        }

        const number = Number(value)

        if (!Number.isFinite(number) || number < 0) {
          return ''
        }

        if (hasSlider) {
          return String(
            Math.min(
              upperBound,
              Math.max(lowerBound, number),
            ),
          )
        }

        return String(number)
      }

      const nextMin = normalize(minDraft)
      const nextMax = normalize(maxDraft)

      if (
        nextMin !== minPrice ||
        nextMax !== maxPrice
      ) {
        onPriceChange(nextMin, nextMax)
      }
    }, 400)

    return () => window.clearTimeout(timer)
  }, [
    minDraft,
    maxDraft,
    minPrice,
    maxPrice,
    invalidRange,
    hasSlider,
    lowerBound,
    upperBound,
    onPriceChange,
  ])

  function handleMinSlider(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const nextMin = Number(event.target.value)

    setMinDraft(String(nextMin))

    if (nextMin > maxNumber) {
      setMaxDraft(String(nextMin))
    }
  }

  function handleMaxSlider(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const nextMax = Number(event.target.value)

    setMaxDraft(String(nextMax))

    if (nextMax < minNumber) {
      setMinDraft(String(nextMax))
    }
  }

  return (
    <section className="filter-group">
      <h3>{localizedCatalogText(filter.label)}</h3>

      <div className="price-inputs">
        <label>
          <span><LocalizedText k="auto.109" /></span>

          <input
            type="number"
            min={filter.min}
            max={filter.max}
            value={minDraft}
            placeholder={String(lowerBound)}
            onChange={(event) => {
              setMinDraft(event.target.value)
            }}
          />
        </label>

        <label>
          <span><LocalizedText k="auto.110" /></span>

          <input
            type="number"
            min={filter.min}
            max={filter.max}
            value={maxDraft}
            placeholder={
              filter.max !== undefined
                ? String(filter.max)
                : ''
            }
            onChange={(event) => {
              setMaxDraft(event.target.value)
            }}
          />
        </label>
      </div>

      {hasSlider && (
        <div className="price-sliders">
          <label className="price-slider-label">
            <span><LocalizedText k="auto.111" /></span>

            <strong>
              {minNumber} {unit}
            </strong>
          </label>

          <input
            type="range"
            className="price-slider"
            aria-label={i18n.t("auto.111")}
            min={lowerBound}
            max={upperBound}
            step={1}
            value={Math.min(
              upperBound,
              Math.max(lowerBound, minNumber),
            )}
            onChange={handleMinSlider}
          />

          <label className="price-slider-label">
            <span><LocalizedText k="auto.112" /></span>

            <strong>
              {maxNumber} {unit}
            </strong>
          </label>

          <input
            type="range"
            className="price-slider"
            aria-label={i18n.t("auto.112")}
            min={lowerBound}
            max={upperBound}
            step={1}
            value={Math.min(
              upperBound,
              Math.max(lowerBound, maxNumber),
            )}
            onChange={handleMaxSlider}
          />
        </div>
      )}

      {invalidRange && (
        <p
          className="price-range-error"
          role="alert"
        >
          <LocalizedText k="auto.113" /> </p>
      )}

      <small className="price-range-hint">
        {filter.min ?? 0}
        {filter.max !== undefined
          ? ` – ${filter.max}`
          : i18n.t("auto.114")}{' '}
        {unit}
      </small>
    </section>
  )
}

// ========================================
// MAIN CATALOG PAGE
// ========================================

export default function CatalogPage() {
  useAtelierTranslation()
  const [searchParams, setSearchParams] =
    useSearchParams()

  const { cart, isLoading: isCartLoading } =
    useCart()

  const searchKey = searchParams.toString()

  const sort =
    searchParams.get('sort') ?? 'newest'

  const query =
    searchParams.get('q') ?? ''

  const selectedFurniture = getFurnitureCategory(searchParams.get('type'))

  const rawPage = Number(
    searchParams.get('page') ?? '1',
  )

  const page =
    Number.isSafeInteger(rawPage) &&
    rawPage > 0
      ? rawPage
      : 1

  const [category, setCategory] =
    useState<Category | null>(null)

  const [products, setProducts] =
    useState<Product[]>([])

  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [limit, setLimit] = useState(12)

  const [loadedKey, setLoadedKey] =
    useState<string | null>(null)

  const [error, setError] =
    useState<string | null>(null)

  const [categoryError, setCategoryError] =
    useState<string | null>(null)

  const [retryKey, setRetryKey] = useState(0)

  const isFetching =
    loadedKey !== searchKey ||
    loadedKey === null

  // ========================================
  // LOAD CATEGORY
  // ========================================

  useEffect(() => {
    let active = true

    getCatalogCategory()
      .then((data) => {
        if (!active) {
          return
        }

        setCategory(data)
        setCategoryError(null)
      })
      .catch(() => {
        if (active) {
          setCategoryError(
            i18n.t("auto.115"),
          )
        }
      })

    return () => {
      active = false
    }
  }, [])

  // ========================================
  // LOAD PRODUCTS
  // ========================================

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams(searchKey)

    const filters: Record<string, string> = {}

    params.forEach((value, key) => {
      if (!RESERVED_PARAMS.has(key)) {
        filters[key] = value
      }
    })

    async function loadProducts() {
      try {
        const minParam = params.get('minPrice')
        const maxParam = params.get('maxPrice')

        const pageParam = Number(
          params.get('page') ?? '1',
        )

        const validPage =
          Number.isSafeInteger(pageParam) &&
          pageParam > 0
            ? pageParam
            : 1

        const productParams = {
          sort: params.get('sort') ?? 'newest',
          page: validPage,
          q: params.get('q') || undefined,
          minPrice: minParam !== null && minParam !== '' && Number.isFinite(Number(minParam))
            ? Number(minParam) : undefined,
          maxPrice: maxParam !== null && maxParam !== '' && Number.isFinite(Number(maxParam))
            ? Number(maxParam) : undefined,
          filters,
          signal: controller.signal,
        }

        // A furniture type spans all brands. Fetch all pages first,
        // then apply an exact type classifier and paginate that result.
        const requestedType = getFurnitureCategory(params.get('type'))
        const data = requestedType
          ? await fetchProductsForFurnitureType(requestedType.query, productParams)
          : await getProducts(productParams)

        if (controller.signal.aborted) {
          return
        }

        setProducts(data.items)
        setTotal(data.total)
        setTotalPages(data.totalPages)
        setLimit(data.limit)
        setError(null)
      } catch (requestError) {
        if (
          controller.signal.aborted ||
          (requestError instanceof DOMException &&
            requestError.name === 'AbortError')
        ) {
          return
        }

        setError(
          i18n.t("auto.116"),
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoadedKey(searchKey)
        }
      }
    }

    void loadProducts()

    return () => {
      controller.abort()
    }
  }, [searchKey, retryKey])

  // ========================================
  // UPDATE URL PARAMETERS
  // ========================================

  const updateParams = useCallback(
    (
      updater: (params: URLSearchParams) => void,
      replace = false,
    ) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)

          updater(next)

          if (
            next.toString() === current.toString()
          ) {
            return current
          }

          next.set('page', '1')

          return next
        },
        { replace },
      )
    },
    [setSearchParams],
  )

  // ========================================
  // SEARCH
  // ========================================

  const handleSearchChange = useCallback(
    (value: string) => {
      updateParams((params) => {
        if (value) {
          params.set('q', value)
        } else {
          params.delete('q')
        }
      })
    },
    [updateParams],
  )

  // ========================================
  // PRICE FILTER
  // ========================================

  const handlePriceChange = useCallback(
    (
      minValue: string,
      maxValue: string,
    ) => {
      updateParams((params) => {
        if (minValue !== '') {
          params.set('minPrice', minValue)
        } else {
          params.delete('minPrice')
        }

        if (maxValue !== '') {
          params.set('maxPrice', maxValue)
        } else {
          params.delete('maxPrice')
        }
      })
    },
    [updateParams],
  )

  // ========================================
  // SORTING
  // ========================================

  function handleSortChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    updateParams((params) => {
      params.set('sort', event.target.value)
    })
  }

  // ========================================
  // CHECKBOX FILTER
  // ========================================

  function handleCheckboxChange(
    filterKey: string,
    optionValue: string,
  ) {
    updateParams((params) => {
      const selected =
        params
          .get(filterKey)
          ?.split(',')
          .filter(Boolean) ?? []

      const next = selected.includes(optionValue)
        ? selected.filter(
            (value) => value !== optionValue,
          )
        : [...selected, optionValue]

      if (next.length > 0) {
        params.set(
          filterKey,
          next.join(','),
        )
      } else {
        params.delete(filterKey)
      }
    })
  }

  // ========================================
  // RADIO FILTER
  // ========================================

  function handleRadioChange(
    filterKey: string,
    optionValue: string,
  ) {
    updateParams((params) => {
      if (
        params.get(filterKey) === optionValue
      ) {
        params.delete(filterKey)
      } else {
        params.set(
          filterKey,
          optionValue,
        )
      }
    })
  }

  function isOptionSelected(
    filterKey: string,
    optionValue: string,
  ) {
    return (
      searchParams
        .get(filterKey)
        ?.split(',')
        .includes(optionValue) ?? false
    )
  }

  // ========================================
  // PAGINATION
  // ========================================

  function goToPage(nextPage: number) {
    if (
      nextPage < 1 ||
      nextPage > totalPages
    ) {
      return
    }

    const next = new URLSearchParams(searchKey)

    next.set('page', String(nextPage))

    setSearchParams(next)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // ========================================
  // CLEAR FILTERS
  // ========================================

  function handleClearAll() {
    setSearchParams({
      sort: 'newest',
      page: '1',
    })
  }

  // ========================================
  // DYNAMIC SERVER-DRIVEN FILTERS
  // ========================================

  function renderFilter(
    filter: CategoryFilter,
  ) {
    if (filter.type === 'range') {
      return (
        <PriceRange
          key={`${filter.key}:${searchParams.get('minPrice') ?? ''}:${searchParams.get('maxPrice') ?? ''}`}
          filter={filter}
          minPrice={
            searchParams.get('minPrice') ?? ''
          }
          maxPrice={
            searchParams.get('maxPrice') ?? ''
          }
          onPriceChange={handlePriceChange}
        />
      )
    }

    return (
      <section
        key={filter.key}
        className="filter-group"
      >
        <h3>{localizedCatalogText(filter.label)}</h3>

        <div className="filter-options">
          {filter.options?.map((option) => (
            <label
              key={option.value}
              className="filter-option"
            >
              <input
                type={
                  filter.type === 'radio'
                    ? 'radio'
                    : 'checkbox'
                }
                name={
                  filter.type === 'radio'
                    ? filter.key
                    : undefined
                }
                value={option.value}
                checked={
                  filter.type === 'radio'
                    ? searchParams.get(
                        filter.key,
                      ) === option.value
                    : isOptionSelected(
                        filter.key,
                        option.value,
                      )
                }
                onChange={() => {
                  if (
                    filter.type === 'radio'
                  ) {
                    handleRadioChange(
                      filter.key,
                      option.value,
                    )
                  } else {
                    handleCheckboxChange(
                      filter.key,
                      option.value,
                    )
                  }
                }}
              />

              {filter.type === 'color' && (
                <span
                  className="color-swatch"
                  aria-hidden="true"
                  style={{
                    backgroundColor:
                      COLOR_MAP[
                        option.value.toLowerCase()
                      ] ?? '#dddddd',
                  }}
                />
              )}

              <span>
                {localizedCatalogText(option.label)}
              </span>
            </label>
          ))}
        </div>

        {filter.type === 'radio' &&
          searchParams.has(filter.key) && (
            <button
              type="button"
              onClick={() => {
                updateParams((params) => {
                  params.delete(filter.key)
                })
              }}
            >
              <LocalizedText k="auto.117" /> </button>
          )}
      </section>
    )
  }

  const firstVisible =
    total > 0
      ? (page - 1) * limit + 1
      : 0

  const lastVisible = Math.min(
    page * limit,
    total,
  )

  const cartQuantity =
    cart?.totalQty ?? 0

  // ========================================
  // PAGE LAYOUT
  // ========================================

  return (
    <main className="catalog-page">
      <div className="catalog-container">
        <header className="catalog-header">
          {/* HOME AND CART NAVIGATION */}
          <nav
            className="catalog-top-nav"
            aria-label="Catalog navigation"
          >
            <Link
              className="catalog-top-link"
              to="/home"
            >
              <LocalizedText k="auto.079" /> </Link>

            <Link
              className="catalog-top-link catalog-cart-link"
              to="/cart"
              aria-label={
                isCartLoading
                  ? i18n.t("auto.064")
                  : `კალათა: ${cartQuantity} ერთეული`
              }
            >
              <ShoppingBag size={19} strokeWidth={1.8} aria-hidden="true" />
              <LocalizedText k="auto.118" /> {!isCartLoading && (
                <span>
                  {' '}({cartQuantity})
                </span>
              )}
            </Link>
          </nav>

          <p className="catalog-eyebrow">
            ATELIER
          </p>

          <h1>

{selectedFurniture
  ? (i18n.language === "en" ? selectedFurniture.en : selectedFurniture.name)
  : (i18n.language === "en" ? category?.nameEn || (category?.name ? localizedCatalogText(category.name) : undefined) : category?.name) ?? i18n.t("auto.119")}

          </h1>



{!selectedFurniture && (
  <p className="catalog-description">
    {category?.description ? localizedCatalogText(category.description) : '\u00a0'}
  </p>
)}


        </header>

        {/* SEARCH AND SORT */}
        <section className="catalog-toolbar">
          <SearchBox
            key={query}
            initialValue={query}
            onSearchChange={handleSearchChange}
          />

          <div className="catalog-sort">
            <label htmlFor="catalog-sort">
              <LocalizedText k="auto.120" /> </label>

            <select
              id="catalog-sort"
              value={sort}
              onChange={handleSortChange}
            >
              <option value="newest">
                <LocalizedText k="sort.newest" />
              </option>
              <option value="oldest">
                <LocalizedText k="sort.oldest" />
              </option>
              <option value="price-asc">
                <LocalizedText k="sort.priceAsc" />
              </option>
              <option value="price-desc">
                <LocalizedText k="sort.priceDesc" />
              </option>
              <option value="rating-desc">
                <LocalizedText k="sort.rating" />
              </option>
              <option value="popular">
                <LocalizedText k="sort.popular" />
              </option>
              <option value="title-asc">
                <LocalizedText k="sort.title" />
              </option>
            </select>
          </div>
        </section>

        <div className="catalog-layout">
          {/* FILTER SIDEBAR */}
          <aside className="catalog-sidebar">
            <div className="filters-header">
              <h2><LocalizedText k="auto.121" /></h2>

              <button
                type="button"
                className="clear-filters-button"
                onClick={handleClearAll}
              >
                <LocalizedText k="auto.122" /> </button>
            </div>

            {categoryError && (
              <p role="alert">
                {categoryError}
              </p>
            )}

            {category ? (
              category.filters.map(renderFilter)
            ) : !categoryError ? (
              <div className="catalog-filters-loading" aria-hidden="true">
                {Array.from({ length: 4 }, (_, index) => (
                  <div className="catalog-filter-placeholder" key={index}>
                    <div className="catalog-filter-placeholder-title" />
                    <div className="catalog-filter-placeholder-lines" />
                  </div>
                ))}
              </div>
            ) : null}
          </aside>

          {/* PRODUCTS */}
          <section className="catalog-results">
            <div className="results-header">
              <p>
                <LocalizedText k="auto.102" />{' '}
                {isFetching ? '...' : i18n.t("fix.productCount", { count: total })} </p>

              {isFetching && (
                <span role="status">
                  <LocalizedText k="auto.123" /> </span>
              )}
            </div>

            {isFetching ? (
              <ProductSkeletons />
            ) : error ? (
              <div className="catalog-state">
                <p role="alert">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setLoadedKey(null)
                    setRetryKey(
                      (value) => value + 1,
                    )
                  }}
                >
                  <LocalizedText k="auto.083" /> </button>
              </div>
            ) : products.length === 0 ? (
              <div className="catalog-state">
                <p>
                  <LocalizedText k="auto.124" /> </p>

                <button
                  type="button"
                  onClick={handleClearAll}
                >
                  <LocalizedText k="auto.125" /> </button>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {products.map((product) => (
                    <article
                      key={product.id}
                      className="product-card"
                    >
                      <Link
                        className="product-image-link"
                        to={`/product/${product.slug}`}
                      >
                        <div className="product-image-wrapper">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.title}
                              loading="lazy"
                            />
                          ) : (
                            <div className="product-image-placeholder">
                              No image
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="product-card-body">
                        {product.brand && (
                          <p className="product-brand">
                            {product.brand}
                          </p>
                        )}

                        <Link
                          className="product-title"
                          to={`/product/${product.slug}`}
                        >
                          {product.title}
                        </Link>

                        <div className="product-rating">
                          <span>
                            ★ {product.rating ?? 0}
                          </span>

                          <span>
                            ({product.reviewsCount ?? 0})
                          </span>
                        </div>

                        <div className="product-price-row">
                          <strong>
                            {product.price} ₾
                          </strong>

                          {product.oldPrice ? (
                            <span className="old-price">
                              {product.oldPrice} ₾
                            </span>
                          ) : null}
                        </div>

                        {product.discountPercent ? (
                          <span className="discount-badge">
                            -{product.discountPercent}%
                          </span>
                        ) : null}

                        <p
                          className={
                            product.inStock === true
                              ? 'stock in-stock'
                              : product.inStock === false
                                ? 'stock out-of-stock'
                                : 'stock'
                          }
                        >
                          {product.inStock === true
                            ? i18n.t("auto.126")
                            : product.inStock === false
                              ? i18n.t("auto.047")
                              : i18n.t("auto.127")}
                        </p>

                        {/* FE-005 ADD TO CART */}
                        <AddToCartButton
                          key={product.id}
                          productId={product.id}
                          inStock={product.inStock}
                        />
                      </div>
                    </article>
                  ))}
                </div>

                {/* PAGINATION */}
                <div className="pagination-section">
                  <p>
                    {i18n.t('catalog.showing', { from: firstVisible, to: lastVisible, total })}
                  </p>

                  <div className="pagination-controls">
                    <button
                      type="button"
                      onClick={() => {
                        goToPage(page - 1)
                      }}
                      disabled={page <= 1}
                    >
                      <LocalizedText k="auto.130" /> </button>

                    <span>
                      <LocalizedText k="auto.131" /> {page} / {totalPages}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        goToPage(page + 1)
                      }}
                      disabled={page >= totalPages}
                    >
                      <LocalizedText k="auto.132" /> </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

