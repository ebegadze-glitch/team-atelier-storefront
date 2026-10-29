
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  getProductBySlug,
  type ProductDetails,
} from '../../features/catalog/api/catalogApi'

import { AddToCartButton } from '../../features/cart/ui/AddToCartButton'

import './ProductDetailsPage.css'

function formatSpecValue(
  value: string | number | boolean,
): string {
  if (typeof value === 'boolean') {
    return value ? 'დიახ' : 'არა'
  }

  return String(value)
}

type ProductContentProps = {
  slug: string
}

function ProductContent({ slug }: ProductContentProps) {
  const [product, setProduct] = useState<ProductDetails | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let active = true

    getProductBySlug(slug)
      .then((data) => {
        if (!active) return

        setProduct(data)
        setError(null)
        setLoading(false)
      })
      .catch(() => {
        if (!active) return

        setError('პროდუქტი ვერ ჩაიტვირთა')
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [slug, retryCount])

  if (loading) {
    return (
      <main className="product-details-page">
        <div className="product-details-container">
          <div
            className="product-details-state"
            role="status"
          >
            <p>პროდუქტი იტვირთება...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="product-details-page">
        <div className="product-details-container">
          <div className="product-details-state">
            <p role="alert">
              {error ?? 'პროდუქტი ვერ მოიძებნა'}
            </p>

            <button
              type="button"
              className="back-to-catalog-button"
              onClick={() => {
                setLoading(true)
                setError(null)
                setRetryCount((count) => count + 1)
              }}
            >
              ხელახლა ცდა
            </button>

            <Link
              className="back-to-catalog-button"
              to="/catalog"
            >
              კატალოგში დაბრუნება
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const images = Array.from(
    new Set(
      [...(product.images ?? []), product.image].filter(
        (image): image is string =>
          typeof image === 'string' &&
          image.trim().length > 0,
      ),
    ),
  )

  const activeImage =
    images[selectedImage] ?? images[0]

  const specifications = Object.entries(
    product.specs ?? {},
  )

  const relatedProducts = product.related ?? []
  const stock = typeof product.stock === 'number' ? Math.max(0, product.stock) : null
  const isOutOfStock = product.inStock === false || stock === 0
  const maxQuantity = Math.max(1, Math.min(Math.floor(stock ?? 99), 99))
  const currency = product.currency === 'GEL' || !product.currency ? '₾' : product.currency

  function changeQuantity(next: number) {
    setQuantity(Math.max(1, Math.min(maxQuantity, next)))
  }

  return (
    <main className="product-details-page">
      <div className="product-details-container">
        <nav className="product-breadcrumbs" aria-label="პროდუქტის ნავიგაცია">
          <Link to="/home">მთავარი</Link>
          <span aria-hidden="true">/</span>
          <Link to="/catalog">{product.category?.name ?? 'ავეჯი'}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.title}</span>
        </nav>

        <div className="product-details-layout">
          {/* Product image gallery */}
          <section
            className="product-details-media"
            aria-label="პროდუქტის ფოტოები"
          >
            <div className="product-details-image">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={`${product.title} — ფოტო ${Math.min(selectedImage + 1, images.length)} / ${images.length}`}
                />
              ) : (
                <div className="product-details-placeholder">
                  ფოტო არ არის
                </div>
              )}

              {product.discountPercent ? (
                <span className="product-details-discount">
                  -{product.discountPercent}%
                </span>
              ) : null}
            </div>

            {images.length > 1 && (
              <div
                className="product-gallery-thumbnails"
                aria-label="ფოტოების გალერეა"
              >
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={
                      index === selectedImage
                        ? 'product-gallery-thumb product-gallery-thumb--active'
                        : 'product-gallery-thumb'
                    }
                    onClick={() => {
                      setSelectedImage(index)
                    }}
                    aria-label={`${product.title} — ფოტო ${index + 1} / ${images.length}`}
                    aria-pressed={
                      index === selectedImage
                    }
                  >
                    <img
                      src={image}
                      alt={`${product.title} — ფოტო ${index + 1} / ${images.length}`}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Product information */}
          <section className="product-details-info">
            {product.brand && (
              <p className="product-details-brand">
                {product.brand}
              </p>
            )}

            <h1>{product.title}</h1>

            <div className="product-details-rating">
              <span>
                ★ {product.rating ?? 0}
              </span>

              <span>
                ({product.reviewsCount ?? 0} შეფასება)
              </span>
            </div>

            <div className="product-details-price">
              <strong>
                {product.price} {currency}
              </strong>

              {product.oldPrice ? (
                <span>
                  {product.oldPrice} {currency}
                </span>
              ) : null}
            </div>

            <div
              className={
                !isOutOfStock
                  ? 'product-details-stock product-details-stock--available'
                  : 'product-details-stock product-details-stock--unavailable'
              }
            >
              <span className="stock-dot" />

              {isOutOfStock
                ? 'ამოწურულია'
                : stock !== null && stock <= 5
                  ? `დარჩა მხოლოდ ${stock} ცალი`
                  : 'მარაგშია'}
            </div>

            {typeof product.warrantyMonths === 'number' &&
              product.warrantyMonths > 0 && (
                <div className="product-details-warranty">
                  <strong>გარანტია:</strong>{' '}
                  {product.warrantyMonths} თვე
                </div>
              )}

            {/* FE-007: choose 1–min(stock, 99) items before adding to the server cart. */}
            <div className="product-quantity" role="group" aria-label="პროდუქტის რაოდენობა">
              <span className="product-quantity-label">რაოდენობა</span>
              <div className="product-quantity-controls">
                <button
                  type="button"
                  aria-label="რაოდენობის შემცირება"
                  onClick={() => changeQuantity(quantity - 1)}
                  disabled={isOutOfStock || quantity <= 1}
                >
                  −
                </button>
                <output aria-live="polite" aria-label="არჩეული რაოდენობა">{quantity}</output>
                <button
                  type="button"
                  aria-label="რაოდენობის გაზრდა"
                  onClick={() => changeQuantity(quantity + 1)}
                  disabled={isOutOfStock || quantity >= maxQuantity}
                >
                  +
                </button>
              </div>
              {stock !== null && !isOutOfStock && (
                <span className="product-quantity-limit">მაქს. {maxQuantity} ცალი</span>
              )}
            </div>

            <AddToCartButton
              key={product.id}
              productId={product.id}
              qty={quantity}
              inStock={!isOutOfStock}
            />

            <div className="product-details-divider" />

            {/* Description */}
            <div className="product-details-summary">
              <h2>პროდუქტის შესახებ</h2>

              <p>
                {product.description?.trim() ||
                  'პროდუქტის აღწერა არ არის მითითებული.'}
              </p>
            </div>

            <Link
              className="continue-shopping-button"
              to="/catalog"
            >
              სხვა პროდუქტების ნახვა
            </Link>
          </section>
        </div>

        {/* Specifications */}
        {specifications.length > 0 && (
          <section className="product-specifications">
            <h2>ტექნიკური მახასიათებლები</h2>

            <div className="product-specifications-scroll">
              <table className="product-specifications-table">
                <tbody>
                  {specifications.map(([key, value]) => (
                    <tr key={key}>
                      <th scope="row">
                        {key}
                      </th>

                      <td>
                        {formatSpecValue(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="related-products">
            <h2>მსგავსი პროდუქტები</h2>

            <div className="related-products-grid">
              {relatedProducts.map((relatedProduct) => (
                <article
                  key={relatedProduct.id}
                  className="related-product-card"
                >
                  <Link
                    to={`/product/${relatedProduct.slug}`}
                    className="related-product-image"
                  >
                    {relatedProduct.image ? (
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="product-details-placeholder">
                        ფოტო არ არის
                      </div>
                    )}
                  </Link>

                  <div className="related-product-info">
                    {relatedProduct.brand && (
                      <p className="related-product-brand">
                        {relatedProduct.brand}
                      </p>
                    )}

                    <Link
                      to={`/product/${relatedProduct.slug}`}
                      className="related-product-title"
                    >
                      {relatedProduct.title}
                    </Link>

                    <div className="related-product-price">
                      <strong>
                        {relatedProduct.price} ₾
                      </strong>

                      {relatedProduct.oldPrice ? (
                        <span>
                          {relatedProduct.oldPrice} ₾
                        </span>
                      ) : null}
                    </div>

                    {relatedProduct.discountPercent ? (
                      <span className="related-product-discount">
                        -{relatedProduct.discountPercent}%
                      </span>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>()

  if (!slug) {
    return (
      <main className="product-details-page">
        <div className="product-details-container">
          <div className="product-details-state">
            <p>პროდუქტის მისამართი არასწორია</p>

            <Link
              className="back-to-catalog-button"
              to="/catalog"
            >
              კატალოგში დაბრუნება
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <ProductContent
      key={slug}
      slug={slug}
    />
  )
}

export default ProductDetailsPage

