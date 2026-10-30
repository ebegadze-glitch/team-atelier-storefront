import i18n from '../../shared/i18n/index'
import { localizedProductField, localizedProductDescription } from '../../shared/i18n/productFields'
import LocalizedText from '../../shared/i18n/LocalizedText'
import { useTranslation as useAtelierTranslation } from 'react-i18next'

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  getProductBySlug,
  type ProductDetails,
} from '../../features/catalog/api/catalogApi'

import { AddToCartButton } from '../../features/cart/ui/AddToCartButton'

import './ProductDetailsPage.css'



type ProductContentProps = {
  slug: string
}

function ProductContent({ slug }: ProductContentProps) {
  useAtelierTranslation()
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

        setError(i18n.t("auto.192"))
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
            <p><LocalizedText k="auto.193" /></p>
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
              {error ?? i18n.t("auto.194")}
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
              <LocalizedText k="auto.083" /> </button>

            <Link
              className="back-to-catalog-button"
              to="/catalog"
            >
              <LocalizedText k="auto.195" /> </Link>
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
        <nav className="product-breadcrumbs" aria-label={i18n.t("auto.196")}>
          <Link to="/home"><LocalizedText k="auto.197" /></Link>
          <span aria-hidden="true">/</span>
          <Link to="/catalog">{i18n.language === "en" && product.category?.slug === "furniture" ? "Furniture" : product.category?.name ?? i18n.t("auto.198")}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.title}</span>
        </nav>

        <div className="product-details-layout">
          {/* Product image gallery */}
          <section
            className="product-details-media"
            aria-label={i18n.t("auto.199")}
          >
            <div className="product-details-image">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={`${product.title} — ფოტო ${Math.min(selectedImage + 1, images.length)} / ${images.length}`}
                />
              ) : (
                <div className="product-details-placeholder">
                  <LocalizedText k="auto.092" /> </div>
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
                aria-label={i18n.t("auto.200")}
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
                ({product.reviewsCount ?? 0} <LocalizedText k="auto.201" /> </span>
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
                ? i18n.t("auto.202")
                : stock !== null && stock <= 5
                  ? `დარჩა მხოლოდ ${stock} ცალი`
                  : i18n.t("auto.126")}
            </div>

            {typeof product.warrantyMonths === 'number' &&
              product.warrantyMonths > 0 && (
                <div className="product-details-warranty">
                  <strong><LocalizedText k="auto.203" /></strong>{' '}
                  {product.warrantyMonths} <LocalizedText k="auto.204" /> </div>
              )}

            {/* FE-007: choose 1–min(stock, 99) items before adding to the server cart. */}
            <div className="product-quantity" role="group" aria-label={i18n.t("auto.205")}>
              <span className="product-quantity-label"><LocalizedText k="auto.206" /></span>
              <div className="product-quantity-controls">
                <button
                  type="button"
                  aria-label={i18n.t("auto.207")}
                  onClick={() => changeQuantity(quantity - 1)}
                  disabled={isOutOfStock || quantity <= 1}
                >
                  −
                </button>
                <output aria-live="polite" aria-label={i18n.t("auto.208")}>{quantity}</output>
                <button
                  type="button"
                  aria-label={i18n.t("auto.209")}
                  onClick={() => changeQuantity(quantity + 1)}
                  disabled={isOutOfStock || quantity >= maxQuantity}
                >
                  +
                </button>
              </div>
              {stock !== null && !isOutOfStock && (
                <span className="product-quantity-limit"><LocalizedText k="auto.110" /> {maxQuantity} <LocalizedText k="auto.210" /></span>
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
              <h2><LocalizedText k="auto.211" /></h2>

              <p>
                {localizedProductDescription(product.description?.trim() ?? '') ||
                  i18n.t("auto.212")}
              </p>
            </div>

            <Link
              className="continue-shopping-button"
              to="/catalog"
            >
              <LocalizedText k="auto.213" /> </Link>
          </section>
        </div>

        {/* Specifications */}
        {specifications.length > 0 && (
          <section className="product-specifications">
            <h2><LocalizedText k="auto.214" /></h2>

            <div className="product-specifications-scroll">
              <table className="product-specifications-table">
                <tbody>
                  {specifications.map(([key, value]) => (
                    <tr key={key}>
                      <th scope="row">
                        {localizedProductField(key)}
                      </th>

                      <td>
                        {localizedProductField(value)}
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
            <h2><LocalizedText k="auto.215" /></h2>

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
                        <LocalizedText k="auto.092" /> </div>
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
  useAtelierTranslation()
  const { slug } = useParams<{ slug: string }>()

  if (!slug) {
    return (
      <main className="product-details-page">
        <div className="product-details-container">
          <div className="product-details-state">
            <p><LocalizedText k="auto.216" /></p>

            <Link
              className="back-to-catalog-button"
              to="/catalog"
            >
              <LocalizedText k="auto.195" /> </Link>
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

