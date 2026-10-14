import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  getCatalogCategory,
  getProducts,
  type Category,
  type CategoryFilter,
  type Product,
} from "../../features/catalog/api/catalogApi";

import "./CatalogPage.css";

const RESERVED_PARAMS = new Set(["sort", "page", "q", "minPrice", "maxPrice"]);

const COLOR_MAP: Record<string, string> = {
  natural: "#d9c3a5",
  white: "#ffffff",
  black: "#111111",
  grey: "#9ca3af",
  gray: "#9ca3af",
  brown: "#8b5e3c",
  blue: "#4f6fae",
  green: "#6f8f72",
  red: "#b85c5c",
  beige: "#d8c8ae",
};

// ========================================
// SKELETON CARDS
// ========================================

function ProductSkeletons() {
  return (
    <div
      className="product-grid"
      role="status"
      aria-label="პროდუქტები იტვირთება"
    >
      {Array.from({ length: 12 }, (_, index) => (
        <div key={index} className="product-card-skeleton" aria-hidden="true">
          <div className="skeleton-image" />

          <div className="skeleton-content">
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-line--short" />
            <div className="skeleton-line skeleton-line--price" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ========================================
// SEARCH BOX
// ========================================

type SearchBoxProps = {
  initialValue: string;
  onSearchChange: (value: string) => void;
};

function SearchBox({ initialValue, onSearchChange }: SearchBoxProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (value.trim() === initialValue) return;

    const timer = window.setTimeout(() => {
      onSearchChange(value.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [value, initialValue, onSearchChange]);

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
  );
}

// ========================================
// PRICE RANGE: INPUTS AND SLIDERS
// ========================================

type PriceRangeProps = {
  filter: CategoryFilter;
  minPrice: string;
  maxPrice: string;
  onPriceChange: (minValue: string, maxValue: string) => void;
};

function PriceRange({
  filter,
  minPrice,
  maxPrice,
  onPriceChange,
}: PriceRangeProps) {
  const lowerBound = filter.min ?? 0;
  const upperBound = filter.max ?? lowerBound;

  const hasSlider = upperBound > lowerBound;
  const unit = filter.unit ?? "₾";

  const [minDraft, setMinDraft] = useState(minPrice);
  const [maxDraft, setMaxDraft] = useState(maxPrice);

  const minNumber =
    minDraft !== "" && Number.isFinite(Number(minDraft))
      ? Number(minDraft)
      : lowerBound;

  const maxNumber =
    maxDraft !== "" && Number.isFinite(Number(maxDraft))
      ? Number(maxDraft)
      : upperBound;

  const invalidRange =
    minDraft !== "" && maxDraft !== "" && Number(minDraft) > Number(maxDraft);

  useEffect(() => {
    if (minDraft === minPrice && maxDraft === maxPrice) {
      return;
    }

    if (invalidRange) return;

    const timer = window.setTimeout(() => {
      const normalize = (value: string) => {
        if (value.trim() === "") return "";

        const number = Number(value);

        if (!Number.isFinite(number) || number < 0) {
          return "";
        }

        if (hasSlider) {
          return String(Math.min(upperBound, Math.max(lowerBound, number)));
        }

        return String(number);
      };

      const nextMin = normalize(minDraft);
      const nextMax = normalize(maxDraft);

      if (nextMin !== minPrice || nextMax !== maxPrice) {
        onPriceChange(nextMin, nextMax);
      }
    }, 400);

    return () => window.clearTimeout(timer);
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
  ]);

  function handleMinSlider(event: ChangeEvent<HTMLInputElement>) {
    const nextMin = Number(event.target.value);

    setMinDraft(String(nextMin));

    if (nextMin > maxNumber) {
      setMaxDraft(String(nextMin));
    }
  }

  function handleMaxSlider(event: ChangeEvent<HTMLInputElement>) {
    const nextMax = Number(event.target.value);

    setMaxDraft(String(nextMax));

    if (nextMax < minNumber) {
      setMinDraft(String(nextMax));
    }
  }

  return (
    <section className="filter-group">
      <h3>{filter.label}</h3>

      <div className="price-inputs">
        <label>
          <span>მინ.</span>

          <input
            type="number"
            min={filter.min}
            max={filter.max}
            value={minDraft}
            placeholder={String(lowerBound)}
            onChange={(event) => setMinDraft(event.target.value)}
          />
        </label>

        <label>
          <span>მაქს.</span>

          <input
            type="number"
            min={filter.min}
            max={filter.max}
            value={maxDraft}
            placeholder={filter.max !== undefined ? String(filter.max) : ""}
            onChange={(event) => setMaxDraft(event.target.value)}
          />
        </label>
      </div>

      {hasSlider && (
        <div className="price-sliders">
          <label className="price-slider-label">
            <span>მინიმალური ფასი</span>

            <strong>
              {minNumber} {unit}
            </strong>
          </label>

          <input
            type="range"
            className="price-slider"
            aria-label="მინიმალური ფასი"
            min={lowerBound}
            max={upperBound}
            step={1}
            value={Math.min(upperBound, Math.max(lowerBound, minNumber))}
            onChange={handleMinSlider}
          />

          <label className="price-slider-label">
            <span>მაქსიმალური ფასი</span>

            <strong>
              {maxNumber} {unit}
            </strong>
          </label>

          <input
            type="range"
            className="price-slider"
            aria-label="მაქსიმალური ფასი"
            min={lowerBound}
            max={upperBound}
            step={1}
            value={Math.min(upperBound, Math.max(lowerBound, maxNumber))}
            onChange={handleMaxSlider}
          />
        </div>
      )}

      {invalidRange && (
        <p className="price-range-error" role="alert">
          მინიმალური ფასი მაქსიმალურზე მეტი ვერ იქნება.
        </p>
      )}

      <small className="price-range-hint">
        {filter.min ?? 0}
        {filter.max !== undefined ? ` – ${filter.max}` : " და მეტი"} {unit}
      </small>
    </section>
  );
}

// ========================================
// MAIN CATALOG PAGE
// ========================================

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchKey = searchParams.toString();

  const sort = searchParams.get("sort") ?? "newest";
  const query = searchParams.get("q") ?? "";

  const rawPage = Number(searchParams.get("page") ?? "1");

  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const [category, setCategory] = useState<Category | null>(null);

  const [products, setProducts] = useState<Product[]>([]);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(12);

  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [retryKey, setRetryKey] = useState(0);

  const isFetching = loadedKey !== searchKey || loadedKey === null;

  // ========================================
  // LOAD CATEGORY
  // ========================================

  useEffect(() => {
    let active = true;

    getCatalogCategory()
      .then((data) => {
        if (active) {
          setCategory(data);
          setCategoryError(null);
        }
      })
      .catch(() => {
        if (active) {
          setCategoryError("კატეგორია ვერ ჩაიტვირთა");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // ========================================
  // LOAD PRODUCTS
  // ========================================

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(searchKey);

    const filters: Record<string, string> = {};

    params.forEach((value, key) => {
      if (!RESERVED_PARAMS.has(key)) {
        filters[key] = value;
      }
    });

    async function loadProducts() {
      try {
        const minParam = params.get("minPrice");
        const maxParam = params.get("maxPrice");

        const pageParam = Number(params.get("page") ?? "1");

        const validPage =
          Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam : 1;

        const data = await getProducts({
          sort: params.get("sort") ?? "newest",
          page: validPage,
          q: params.get("q") || undefined,
          minPrice:
            minParam !== null &&
            minParam !== "" &&
            Number.isFinite(Number(minParam))
              ? Number(minParam)
              : undefined,
          maxPrice:
            maxParam !== null &&
            maxParam !== "" &&
            Number.isFinite(Number(maxParam))
              ? Number(maxParam)
              : undefined,
          filters,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        setProducts(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setLimit(data.limit);
        setError(null);
      } catch (requestError) {
        if (
          controller.signal.aborted ||
          (requestError instanceof DOMException &&
            requestError.name === "AbortError")
        ) {
          return;
        }

        setError("პროდუქტები ვერ ჩაიტვირთა");
      } finally {
        if (!controller.signal.aborted) {
          setLoadedKey(searchKey);
        }
      }
    }

    void loadProducts();

    return () => controller.abort();
  }, [searchKey, retryKey]);

  // ========================================
  // URL PARAMETER UPDATES
  // ========================================

  const updateParams = useCallback(
    (updater: (params: URLSearchParams) => void, replace = false) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);

          updater(next);

          if (next.toString() !== current.toString()) {
            next.set("page", "1");
          }

          return next;
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  // ========================================
  // SEARCH WITH DEBOUNCE
  // ========================================

  const handleSearchChange = useCallback(
    (value: string) => {
      updateParams((params) => {
        if (value) {
          params.set("q", value);
        } else {
          params.delete("q");
        }
      });
    },
    [updateParams],
  );

  // ========================================
  // PRICE FILTER WITH ATOMIC UPDATE
  // ========================================

  const handlePriceChange = useCallback(
    (minValue: string, maxValue: string) => {
      updateParams((params) => {
        if (minValue !== "") {
          params.set("minPrice", minValue);
        } else {
          params.delete("minPrice");
        }

        if (maxValue !== "") {
          params.set("maxPrice", maxValue);
        } else {
          params.delete("maxPrice");
        }
      });
    },
    [updateParams],
  );

  // ========================================
  // SORTING
  // ========================================

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    const selectedSort = event.target.value;

    updateParams((params) => {
      params.set("sort", selectedSort);
    });
  }

  // ========================================
  // CHECKBOX FILTER
  // ========================================

  function handleCheckboxChange(filterKey: string, optionValue: string) {
    updateParams((params) => {
      const selected = params.get(filterKey)?.split(",").filter(Boolean) ?? [];

      const next = selected.includes(optionValue)
        ? selected.filter((value) => value !== optionValue)
        : [...selected, optionValue];

      if (next.length > 0) {
        params.set(filterKey, next.join(","));
      } else {
        params.delete(filterKey);
      }
    });
  }

  // ========================================
  // RADIO FILTER
  // ========================================

  function handleRadioChange(filterKey: string, optionValue: string) {
    updateParams((params) => {
      if (params.get(filterKey) === optionValue) {
        params.delete(filterKey);
      } else {
        params.set(filterKey, optionValue);
      }
    });
  }

  function isOptionSelected(filterKey: string, optionValue: string) {
    return (
      searchParams.get(filterKey)?.split(",").includes(optionValue) ?? false
    );
  }

  // ========================================
  // PAGINATION
  // ========================================

  function goToPage(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }

    const next = new URLSearchParams(searchKey);
    next.set("page", String(nextPage));

    setSearchParams(next);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ========================================
  // CLEAR FILTERS
  // ========================================

  function handleClearAll() {
    setSearchParams({
      sort: "newest",
      page: "1",
    });
  }

  // ========================================
  // DYNAMIC SERVER-DRIVEN FILTERS
  // ========================================

  function renderFilter(filter: CategoryFilter) {
    if (filter.type === "range") {
      return (
        <PriceRange
          key={`${filter.key}:${searchParams.get("minPrice") ?? ""}:${searchParams.get("maxPrice") ?? ""}`}
          filter={filter}
          minPrice={searchParams.get("minPrice") ?? ""}
          maxPrice={searchParams.get("maxPrice") ?? ""}
          onPriceChange={handlePriceChange}
        />
      );
    }

    return (
      <section key={filter.key} className="filter-group">
        <h3>{filter.label}</h3>

        <div className="filter-options">
          {filter.options?.map((option) => (
            <label key={option.value} className="filter-option">
              <input
                type={filter.type === "radio" ? "radio" : "checkbox"}
                name={filter.type === "radio" ? filter.key : undefined}
                value={option.value}
                checked={
                  filter.type === "radio"
                    ? searchParams.get(filter.key) === option.value
                    : isOptionSelected(filter.key, option.value)
                }
                onChange={() =>
                  filter.type === "radio"
                    ? handleRadioChange(filter.key, option.value)
                    : handleCheckboxChange(filter.key, option.value)
                }
              />

              {filter.type === "color" && (
                <span
                  className="color-swatch"
                  aria-hidden="true"
                  style={{
                    backgroundColor:
                      COLOR_MAP[option.value.toLowerCase()] ?? "#dddddd",
                  }}
                />
              )}

              <span>{option.label}</span>
            </label>
          ))}
        </div>

        {filter.type === "radio" && searchParams.has(filter.key) && (
          <button
            type="button"
            onClick={() => {
              updateParams((params) => {
                params.delete(filter.key);
              });
            }}
          >
            ამ ფილტრის მოხსნა
          </button>
        )}
      </section>
    );
  }

  const firstVisible = total > 0 ? (page - 1) * limit + 1 : 0;

  const lastVisible = Math.min(page * limit, total);

  // ========================================
  // PAGE LAYOUT
  // ========================================

  return (
    <main className="catalog-page">
      <div className="catalog-container">
        <header className="catalog-header">
          <p className="catalog-eyebrow">ATELIER</p>

          <h1>{category?.name ?? "კატალოგი"}</h1>

          {category?.description && (
            <p className="catalog-description">{category.description}</p>
          )}
        </header>

        <section className="catalog-toolbar">
          <SearchBox
            key={query}
            initialValue={query}
            onSearchChange={handleSearchChange}
          />

          <div className="catalog-sort">
            <label htmlFor="catalog-sort">სორტირება</label>

            <select id="catalog-sort" value={sort} onChange={handleSortChange}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating-desc">Rating</option>
              <option value="popular">Popular</option>
              <option value="title-asc">Title A-Z</option>
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

            {categoryError && <p role="alert">{categoryError}</p>}

            {category?.filters.map(renderFilter)}
          </aside>

          <section className="catalog-results">
            <div className="results-header">
              <p>სულ {isFetching ? "..." : total} პროდუქტი</p>

              {isFetching && <span role="status">იტვირთება...</span>}
            </div>

            {isFetching ? (
              <ProductSkeletons />
            ) : error ? (
              <div className="catalog-state">
                <p role="alert">{error}</p>

                <button
                  type="button"
                  onClick={() => {
                    setLoadedKey(null);
                    setRetryKey((value) => value + 1);
                  }}
                >
                  ხელახლა ცდა
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="catalog-state">
                <p>ვერაფერი მოიძებნა</p>

                <button type="button" onClick={handleClearAll}>
                  ფილტრების გასუფთავება
                </button>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {products.map((product) => (
                    <article key={product.id} className="product-card">
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
                          <p className="product-brand">{product.brand}</p>
                        )}

                        <Link
                          className="product-title"
                          to={`/product/${product.slug}`}
                        >
                          {product.title}
                        </Link>

                        <div className="product-rating">
                          <span>★ {product.rating ?? 0}</span>

                          <span>({product.reviewsCount ?? 0})</span>
                        </div>

                        <div className="product-price-row">
                          <strong>{product.price} ₾</strong>

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
                              ? "stock in-stock"
                              : product.inStock === false
                                ? "stock out-of-stock"
                                : "stock"
                          }
                        >
                          {product.inStock === true
                            ? "მარაგშია"
                            : product.inStock === false
                              ? "არ არის მარაგში"
                              : "მარაგი უცნობია"}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="pagination-section">
                  <p>
                    ნაჩვენებია {firstVisible}–{lastVisible}, სულ {total}
                  </p>

                  <div className="pagination-controls">
                    <button
                      type="button"
                      onClick={() => goToPage(page - 1)}
                      disabled={page <= 1}
                    >
                      წინა
                    </button>

                    <span>
                      გვერდი {page} / {totalPages}
                    </span>

                    <button
                      type="button"
                      onClick={() => goToPage(page + 1)}
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
  );
}
