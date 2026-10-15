
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/model/useAuth'
import './HomePage.css'

const featuredBrands = [
  {
    name: 'IKEA',
    number: '01',
    description: 'Scandinavian living',
    image: '/images/ikea-logo.png',
  },
  {
    name: 'JYSK',
    number: '02',
    description: 'Nordic comfort',
    image: '/images/jysk-logo.png',
  },
  {
    name: 'CASA',
    number: '03',
    description: 'Elegant interiors',
    image: '/images/casa-logo.png',
  },
] as const

export default function HomePage() {
  const { user, logout } = useAuth()

  const displayName =
    user?.name?.trim() ||
    user?.email?.split('@')[0] ||
    'User'

  const userInitial = displayName.charAt(0).toUpperCase()

  return (
    <main className="home-page">
      <div className="home-container">
        <header className="home-header">
          <Link className="home-brand" to="/home">
            ATELIER
          </Link>

          <nav
            className="home-navigation"
            aria-label="Main navigation"
          >
            <Link
              className="home-header-link"
              to="/catalog"
            >
              Catalog
            </Link>

            <button
              type="button"
              className="home-icon-button"
              title="Wishlist — coming soon"
              aria-label="Wishlist — coming soon"
              disabled
            >
              <span className="home-icon" aria-hidden="true">
                ♡
              </span>
              <span className="home-icon-label">
                Wishlist
              </span>
            </button>

            <button
              type="button"
              className="home-icon-button"
              title="Shopping cart — coming soon"
              aria-label="Shopping cart — coming soon"
              disabled
            >
              <span className="home-icon" aria-hidden="true">
                🛍
              </span>
              <span className="home-icon-label">
                Cart
              </span>
            </button>

            <div className="home-user-menu">
              <div
                className="home-user-avatar"
                aria-hidden="true"
              >
                {userInitial}
              </div>

              <div className="home-user-data">
                <strong>{displayName}</strong>
                <span>{user?.email}</span>
              </div>
            </div>

            <Link
              className="home-header-link"
              to="/profile"
            >
              My Profile
            </Link>

            <button
              type="button"
              className="home-logout-button"
              onClick={logout}
            >
              Log out
            </button>
          </nav>
        </header>

        <section className="home-hero">
          <div className="home-hero-content">
            <p className="home-eyebrow">
              ATELIER FURNITURE
            </p>

            <h1 className="home-title">
              ავეჯი თანამედროვე
              <span>ცხოვრებისთვის</span>
            </h1>

            <p className="home-description">
              აღმოაჩინე Atelier-ის ავეჯის კოლექცია,
              მოძებნე სასურველი პროდუქტი,
              გამოიყენე ფილტრები და ნახე სრული
              დეტალური ინფორმაცია.
            </p>

            <div className="home-category-links">
              <Link
                to="/catalog"
                className="home-category-link home-category-link--primary"
              >
                კატალოგი
              </Link>

              <Link
                to="/catalog?sort=price-asc&page=1"
                className="home-category-link"
              >
                ფასდაკლება
              </Link>

              <Link
                to="/catalog?sort=newest&page=1"
                className="home-category-link"
              >
                ახალი კოლექცია
              </Link>
            </div>
          </div>

          <aside className="home-mini-account">
            <div className="home-mini-account-top">
              <div
                className="home-mini-avatar"
                aria-hidden="true"
              >
                {userInitial}
              </div>

              <span className="home-active-badge">
                Active
              </span>
            </div>

            <div className="home-mini-user">
              <strong>{displayName}</strong>
              <span>
                {user?.email ?? 'Email unavailable'}
              </span>
            </div>

            <Link
              className="home-mini-link"
              to="/catalog"
            >
              Browse collection →
            </Link>
          </aside>
        </section>

        <section className="home-brands-section">
          <div className="home-section-heading">
            <div>
              <p className="home-section-eyebrow">
                FEATURED BRANDS
              </p>

              <h2>აღმოაჩინე წამყვანი ბრენდები</h2>
            </div>

            <Link
              to="/catalog"
              className="home-view-all"
            >
              ყველა პროდუქტი →
            </Link>
          </div>

          <div className="home-brand-grid">
            {featuredBrands.map((brand) => (
              <Link
                key={brand.name}
                to={`/catalog?brand=${encodeURIComponent(
                  brand.name,
                )}&page=1`}
                className="home-brand-card"
              >
                <div className="home-brand-image">
                  <img
                    src={brand.image}
                    alt={brand.name}
                  />

                  <div
                    className="home-brand-overlay"
                    aria-hidden="true"
                  />

                  <div className="home-brand-content">
                    <span className="home-card-number">
                      {brand.number}
                    </span>

                    <div>
                      <p>{brand.description}</p>
                      <h3>{brand.name}</h3>

                      <span className="home-shop-now">
                        კოლექციის ნახვა →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <footer className="home-footer">
          <div className="home-footer-brand">
            <strong>ATELIER</strong>
            <p>
              Furniture for thoughtful interiors.
            </p>
          </div>

          <div className="home-footer-contact">
            <span>
              18 Atelier Street, Tbilisi, Georgia
            </span>
            <span>+995 32 2 45 67 89</span>
            <span>hello@atelier.ge</span>
          </div>

          <div className="home-socials">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
            >
              ◎
            </a>

            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              title="Facebook"
            >
              f
            </a>

            <a
              href="https://www.pinterest.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pinterest"
              title="Pinterest"
            >
              p
            </a>
          </div>
        </footer>

        <div className="home-footer-bottom">
          <span>
            © 2026 Atelier. All rights reserved.
          </span>
          <span>
            Designed for modern living.
          </span>
        </div>
      </div>
    </main>
  )
}
