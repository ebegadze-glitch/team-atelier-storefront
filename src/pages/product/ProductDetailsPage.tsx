import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  getProductBySlug,
  type ProductDetails,
} from '../../features/catalog/api/catalogApi'

import './ProductDetailsPage.css'

function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>()

  const [product, setProduct] =
    useState<ProductDetails | null>(null)

  const [loading, setLoading] =
    useState(Boolean(slug))

  const [error, setError] =
    useState<string | null>(
      slug
        ? null
        : 'პროდუქტის მისამართი არასწორია',
    )

  useEffect(() => {
    if (!slug) {
      return
    }

    const productSlug = slug
    const controller = new AbortController()

    async function loadProduct() {
      try {
        const data =
          await getProductBySlug(productSlug)

        if (!controller.signal.aborted) {
          setProduct(data)
        }
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === 'AbortError'
        ) {
          return
        }

        if (!controller.signal.aborted) {
          setError('პროდუქტი ვერ ჩაიტვირთა')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      controller.abort()
    }
  }, [slug])

  if (loading) {
    return (
      <main className="product-details-page">
        <div className="product-details-container">
          <div className="product-details-state">
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
            <p>
              {error ??
                'პროდუქტი ვერ მოიძებნა'}
            </p>

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
    <main className="product-details-page">
      <div className="product-details-container">
        <Link
          className="product-back-link"
          to="/catalog"
        >
          ← კატალოგში დაბრუნება
        </Link>

        <div className="product-details-layout">
          <section className="product-details-media">
            <div className="product-details-image">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                />
              ) : (
                <div className="product-details-placeholder">
                  No image
                </div>
              )}

              {product.discountPercent ? (
                <span className="product-details-discount">
                  -{product.discountPercent}%
                </span>
              ) : null}
            </div>
          </section>

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
                {product.price} ₾
              </strong>

              {product.oldPrice ? (
                <span>
                  {product.oldPrice} ₾
                </span>
              ) : null}
            </div>

            <div
              className={
                product.inStock
                  ? 'product-details-stock product-details-stock--available'
                  : 'product-details-stock product-details-stock--unavailable'
              }
            >
              <span className="stock-dot" />

              {product.inStock
                ? 'მარაგშია'
                : 'არ არის მარაგში'}
            </div>

            <div className="product-details-divider" />

            <div className="product-details-summary">
              <h2>პროდუქტის შესახებ</h2>

              <p>
                იხილეთ პროდუქტის ძირითადი ინფორმაცია,
                ფასი, ხელმისაწვდომობა და შეფასება.
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
      </div>
    </main>
  )
}

export default ProductDetailsPage 