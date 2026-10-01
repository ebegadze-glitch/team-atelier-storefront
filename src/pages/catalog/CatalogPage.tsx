import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
} from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import {
  getCatalogCategory,
  getProducts,
  type Category,
  type CategoryFilter,
  type Product,
} from '../../features/catalog/api/catalogApi'

import './CatalogPage.css'

const RESERVED_PARAMS = new Set([
  'sort',
  'page',
  'q',
  'minPrice',
  'maxPrice',
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

type SearchBoxProps = {
  initialValue: string
  onSearchChange: (value: string) => void
}

function SearchBox({
  initialValue,
  onSearchChange,
}: SearchBoxProps) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onSearchChange(value.trim())
    }, 400)

    return () => {
      window.clearTimeout(timer)
    }
  }, [value, onSearchChange])

  return (
    <div className="catalog-search">
      <label htmlFor="catalog-search">ძებნა</label>

      <input
        id="catalog-search"
        type="search"
        value={value}
        placeholder="მოძებნე პროდუქტი..."
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  )
}

function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const searchKey = searchParams.toString()
  const sort = searchParams.get('sort') ?? 'newest'
  const query = searchParams.get('q') ?? ''

  const rawPage = Number(searchParams.get('page') ?? '1')

  const page =
    Number.isFinite(rawPage) && rawPage > 0
      ? rawPage
      : 1

  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])

  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [limit, setLimit] = useState(12)

  const [loading, setLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadCategory() {
      try {
        const data = await getCatalogCategory()

        if (mounted) {
          setCategory(data)
        }
      } catch {
        if (mounted) {
          setError('კატეგორია ვერ ჩაიტვირთა')
        }
      }
    }

    loadCategory()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadProducts() {
      try {
        setIsFetching(true)
        setError(null)

        const currentParams = new URLSearchParams(searchKey)

        const filters: Record<string, string> = {}

        currentParams.forEach((value, key) => {
          if (!RESERVED_PARAMS.has(key)) {
            filters[key] = value
          }
        })

        const minPriceParam = currentParams.get('minPrice')
        const maxPriceParam = currentParams.get('maxPrice')

        const data = await getProducts({
          sort,
          page,
          q: query || undefined,

          minPrice: minPriceParam
            ? Number(minPriceParam)
            : undefined,

          maxPrice: maxPriceParam
            ? Number(maxPriceParam)
            : undefined,

          filters,
          signal: controller.signal,
        })

        setProducts(data.items)
        setTotal(data.total)
        setTotalPages(data.totalPages)
        setLimit(data.limit)
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === 'AbortError'
        ) {
          return
        }

        setError('პროდუქტები ვერ ჩაიტვირთა')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
          setIsFetching(false)
        }
      }
    }

    loadProducts()

    return () => {
      controller.abort()
    }
  }, [searchKey, sort, page, query])

  function updateParams(
    updater: (params: URLSearchParams) => void,
    resetPage = true,
  ) {
    const nextParams = new URLSearchParams(searchParams)

    updater(nextParams)

    if (resetPage) {
      nextParams.set('page', '1')
    }

    setSearchParams(nextParams)
  }

  const handleSearchChange = useCallback(
    (value: string) => {
      const nextParams = new URLSearchParams(searchKey)
      const currentQuery = nextParams.get('q') ?? ''

      if (value === currentQuery) {
        return
      }

      if (value) {
        nextParams.set('q', value)
      } else {
        nextParams.delete('q')
      }

      nextParams.set('page', '1')

      setSearchParams(nextParams)
    },
    [searchKey, setSearchParams],
  )

  function handleSortChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    updateParams((params) => {
      params.set('sort', event.target.value)
    })
  }

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

      const alreadySelected = selected.includes(optionValue)

      const nextValues = alreadySelected
        ? selected.filter((value) => value !== optionValue)
        : [...selected, optionValue]

      if (nextValues.length > 0) {
        params.set(filterKey, nextValues.join(','))
      } else {
        params.delete(filterKey)
      }
    })
  }

  function handleRadioChange(
    filterKey: string,
    optionValue: string,
  ) {
    updateParams((params) => {
      params.set(filterKey, optionValue)
    })
  }

  function handlePriceChange(
    key: 'minPrice' | 'maxPrice',
    value: string,
  ) {
    updateParams((params) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
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

  function goToPage(nextPage: number) {
    const nextParams = new URLSearchParams(searchParams)

    nextParams.set('page', String(nextPage))

    setSearchParams(nextParams)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function handleClearAll() {
    const nextParams = new URLSearchParams()

    nextParams.set('sort', 'newest')
    nextParams.set('page', '1')

    setSearchParams(nextParams)
  }

  function renderFilter(filter: CategoryFilter) {
    if (
      filter.type === 'checkbox' ||
      filter.type === 'color'
    ) {
      return (
        <section
          key={filter.key}
          className="filter-group"
        >
          <h3>{filter.label}</h3>

          <div className="filter-options">
            {filter.options?.map((option) => (
              <label
                key={option.value}
                className="filter-option"
              >
                <input
                  type="checkbox"
                  checked={isOptionSelected(
                    filter.key,
                    option.value,
                  )}
                  onChange={() =>
                    handleCheckboxChange(
                      filter.key,
                      option.value,
                    )
                  }
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

                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </section>
      )
    }

    if (filter.type === 'radio') {
      return (
        <section
          key={filter.key}
          className="filter-group"
        >
          <h3>{filter.label}</h3>

          <div className="filter-options">
            {filter.options?.map((option) => (
              <label
                key={option.value}
                className="filter-option"
              >
                <input
                  type="radio"
                  name={filter.key}
                  value={option.value}
                  checked={
                    searchParams.get(filter.key) === option.value
                  }
                  onChange={() =>
                    handleRadioChange(
                      filter.key,
                      option.value,
                    )
                  }
                />

                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </section>
      )
    }

    if (filter.type === 'range') {
      const minPrice =
        searchParams.get('minPrice') ?? ''

      const maxPrice =
        searchParams.get('maxPrice') ?? ''

      return (
        <section
          key={filter.key}
          className="filter-group"
        >
          <h3>{filter.label}</h3>

          <div className="price-inputs">
            <label>
              <span>მინ.</span>

              <input
                type="number"
                min={filter.min}
                max={filter.max}
                value={minPrice}
                placeholder={String(filter.min ?? '')}
                onChange={(event) =>
                  handlePriceChange(
                    'minPrice',
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>მაქს.</span>

              <input
                type="number"
                min={filter.min}
                max={filter.max}
                value={maxPrice}
                placeholder={String(filter.max ?? '')}
                onChange={(event) =>
                  handlePriceChange(
                    'maxPrice',
                    event.target.value,
                  )
                }
              />
            </label>
          </div>

          <small className="price-range-hint">
            {filter.min} – {filter.max} {filter.unit}
          </small>
        </section>
      )
    }

    return null
  }

  if (loading && !category) {
    return (
      <main className="catalog-page">
        <div className="catalog-container">
          <div className="catalog-state">
            <p>კატალოგი იტვირთება...</p>
          </div>
        </div>
      </main>
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

  return (
    <main className="catalog-page">
      <div className="catalog-container">
        <header className="catalog-header">
          <p className="catalog-eyebrow">
            ATELIER
          </p>

          <h1>
            {category?.name ?? 'კატალოგი'}
          </h1>

          {category?.description && (
            <p className="catalog-description">
              {category.description}
            </p>
          )}
        </header>

        <section className="catalog-toolbar">
          <SearchBox
            key={query}
            initialValue={query}
            onSearchChange={handleSearchChange}
          />

          <div className="catalog-sort">
            <label htmlFor="catalog-sort">
              სორტირება
            </label>

            <select
              id="catalog-sort"
              value={sort}
              onChange={handleSortChange}
            >
              <option value="newest">
                Newest
              </option>

              <option value="oldest">
                Oldest
              </option>

              <option value="price-asc">
                Price: low to high
              </option>

              <option value="price-desc">
                Price: high to low
              </option>

              <option value="rating-desc">
                Rating
              </option>

              <option value="popular">
                Popular
              </option>

              <option value="title-asc">
                Title A-Z
              </option>
            </select>
          </div>
        </section>

        <div className="catalog-layout">
          <aside className="catalog-sidebar">
            <div className="filters-header">
              <h2>ფილტრები</h2>

              <button
                type="button"
                className="clear-filters-button"
                onClick={handleClearAll}
              >
                გასუფთავება
              </button>
            </div>

            {category?.filters.map(renderFilter)}
          </aside>

          <section className="catalog-results">
            <div className="results-header">
              <p>
                სულ {total} პროდუქტი
              </p>

              {isFetching && (
                <span role="status">
                  იტვირთება...
                </span>
              )}
            </div>

            {error && (
              <div className="catalog-state">
                <p>{error}</p>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                >
                  ხელახლა ცდა
                </button>
              </div>
            )}

            {!error &&
              !isFetching &&
              products.length === 0 && (
                <div className="catalog-state">
                  <p>
                    ვერაფერი მოიძებნა
                  </p>

                  <button
                    type="button"
                    onClick={handleClearAll}
                  >
                    ფილტრების გასუფთავება
                  </button>
                </div>
              )}

            {!error &&
              products.length > 0 && (
                <>
                  <div
                    className={
                      isFetching
                        ? 'product-grid product-grid--loading'
                        : 'product-grid'
                    }
                  >
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
                              product.inStock
                                ? 'stock in-stock'
                                : 'stock out-of-stock'
                            }
                          >
                            {product.inStock
                              ? 'მარაგშია'
                              : 'არ არის მარაგში'}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="pagination-section">
                    <p>
                      ნაჩვენებია {firstVisible}–
                      {lastVisible}, სულ {total}
                    </p>

                    <div className="pagination-controls">
                      <button
                        type="button"
                        onClick={() =>
                          goToPage(page - 1)
                        }
                        disabled={page <= 1}
                      >
                        წინა
                      </button>

                      <span>
                        გვერდი {page} / {totalPages}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          goToPage(page + 1)
                        }
                        disabled={page >= totalPages}
                      >
                        შემდეგი
                      </button>
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

export default CatalogPage