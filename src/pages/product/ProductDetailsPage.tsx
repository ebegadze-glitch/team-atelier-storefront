import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getProductBySlug,
  type ProductDetails,
} from "../../features/catalog/api/catalogApi";

import "./ProductDetailsPage.css";

// Format specification values
function formatSpecValue(value: string | number | boolean) {
  if (typeof value === "boolean") {
    return value ? "დიახ" : "არა";
  }

  return String(value);
}

// Product details content
function ProductContent({ slug }: { slug: string }) {
  const [product, setProduct] = useState<ProductDetails | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // LOAD PRODUCT
  useEffect(() => {
    let active = true;

    getProductBySlug(slug)
      .then((data) => {
        if (!active) return;

        setProduct(data);
        setError(null);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;

        setError("პროდუქტი ვერ ჩაიტვირთა");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, retryCount]);

  // LOADING STATE
  if (loading) {
    return (
      <main className="product-details-page">
        <div className="product-details-container">
          <div className="product-details-state" role="status">
            <p>პროდუქტი იტვირთება...</p>
          </div>
        </div>
      </main>
    );
  }

  // ERROR STATE
  if (error || !product) {
    return (
      <main className="product-details-page">
        <div className="product-details-container">
          <div className="product-details-state">
            <p role="alert">{error ?? "პროდუქტი ვერ მოიძებნა"}</p>

            <button
              type="button"
              className="back-to-catalog-button"
              onClick={() => {
                setLoading(true);
                setError(null);
                setRetryCount((count) => count + 1);
              }}
            >
              ხელახლა ცდა
            </button>

            <Link className="back-to-catalog-button" to="/catalog">
              კატალოგში დაბრუნება
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // PRODUCT IMAGES
  const images = Array.from(
    new Set(
      [...(product.images ?? []), product.image].filter(
        (image): image is string =>
          typeof image === "string" && image.trim().length > 0,
      ),
    ),
  );

  const activeImage = images[selectedImage] ?? images[0];

  // SPECIFICATIONS
  const specifications = Object.entries(product.specs ?? {});

  // RELATED PRODUCTS
  const relatedProducts = product.related ?? [];

  return (
    <main className="product-details-page">
      <div className="product-details-container">
        <Link className="product-back-link" to="/catalog">
          ← კატალოგში დაბრუნება
        </Link>

        <div className="product-details-layout">
          {/* IMAGE GALLERY */}
          <section
            className="product-details-media"
            aria-label="პროდუქტის ფოტოები"
          >
            <div className="product-details-image">
              {activeImage ? (
                <img src={activeImage} alt={product.title} />
              ) : (
                <div className="product-details-placeholder">ფოტო არ არის</div>
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
                        ? "product-gallery-thumb product-gallery-thumb--active"
                        : "product-gallery-thumb"
                    }
                    onClick={() => setSelectedImage(index)}
                    aria-label={`ფოტო ${index + 1}`}
                    aria-pressed={index === selectedImage}
                  >
                    <img
                      src={image}
                      alt={`${product.title} — ფოტო ${index + 1}`}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* PRODUCT INFORMATION */}
          <section className="product-details-info">
            {product.brand && (
              <p className="product-details-brand">{product.brand}</p>
            )}

            <h1>{product.title}</h1>

            <div className="product-details-rating">
              <span>★ {product.rating ?? 0}</span>

              <span>({product.reviewsCount ?? 0} შეფასება)</span>
            </div>

            <div className="product-details-price">
              <strong>{product.price} ₾</strong>

              {product.oldPrice ? <span>{product.oldPrice} ₾</span> : null}
            </div>

            <div
              className={
                product.inStock
                  ? "product-details-stock product-details-stock--available"
                  : "product-details-stock product-details-stock--unavailable"
              }
            >
              <span className="stock-dot" />

              {product.inStock === true
                ? "მარაგშია"
                : product.inStock === false
                  ? "არ არის მარაგში"
                  : "მარაგის ინფორმაცია მიუწვდომელია"}
            </div>

            {/* WARRANTY */}
            {product.warrantyMonths !== undefined &&
              product.warrantyMonths !== null && (
                <div className="product-details-warranty">
                  <strong>გარანტია:</strong> {product.warrantyMonths} თვე
                </div>
              )}

            <div className="product-details-divider" />

            {/* DESCRIPTION */}
            <div className="product-details-summary">
              <h2>პროდუქტის შესახებ</h2>

              <p>
                {product.description?.trim() ||
                  "პროდუქტის აღწერა არ არის მითითებული."}
              </p>
            </div>

            <Link className="continue-shopping-button" to="/catalog">
              სხვა პროდუქტების ნახვა
            </Link>
          </section>
        </div>

        {/* SPECIFICATIONS TABLE */}
        {specifications.length > 0 && (
          <section className="product-specifications">
            <h2>ტექნიკური მახასიათებლები</h2>

            <div className="product-specifications-scroll">
              <table className="product-specifications-table">
                <tbody>
                  {specifications.map(([key, value]) => (
                    <tr key={key}>
                      <th scope="row">{key}</th>

                      <td>{formatSpecValue(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* RELATED PRODUCTS */}
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
                      <strong>{relatedProduct.price} ₾</strong>

                      {relatedProduct.oldPrice ? (
                        <span>{relatedProduct.oldPrice} ₾</span>
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
  );
}

// Route component
function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return (
      <main className="product-details-page">
        <div className="product-details-container">
          <div className="product-details-state">
            <p>პროდუქტის მისამართი არასწორია</p>

            <Link className="back-to-catalog-button" to="/catalog">
              კატალოგში დაბრუნება
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <ProductContent key={slug} slug={slug} />;
}

export default ProductDetailsPage;
