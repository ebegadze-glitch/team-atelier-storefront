import ThemeToggle from '../shared/theme/ThemeToggle'
import { useTranslation as useAtelierTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Grid2X2, Heart, LogIn, LogOut, ShoppingBag, UserRound } from 'lucide-react'

import { useAuth } from '../features/auth/model/useAuth'
import { useCart } from '../features/cart/model/useCart'
import { categoryCatalogUrl, furnitureCategories } from '../shared/data/furnitureCategories'
import './HomePage.css'
import '../shared/styles/atelierTheme.css'

// Brand pictures come from the user's reference grid, retaining their
// original contents and proportions rather than stretching them.
const brands = [
  { name: 'Casa', image: 'brand-casa.webp' },
  { name: 'Ergo', image: 'brand-ergo.webp' },
  { name: 'IKEA', image: 'brand-ikea.webp' },
  { name: 'JYSK', image: 'brand-jysk.webp' },
  { name: 'Loft', image: 'brand-loft.webp' },
  { name: 'Nordic Home', image: 'brand-nordic-home.webp' },
  { name: 'Vitra', image: 'brand-vitra.webp' },
  { name: 'Woodline', image: 'brand-woodline.webp' },
] as const

const imageBase = '/images/home/'

function Header() {
  useAtelierTranslation()
  const { t, i18n } = useTranslation()
  const { status, logout } = useAuth()
  const { cart, isLoading: isCartLoading } = useCart()
  const isSignedIn = status === 'authenticated'
  const cartQuantity = cart?.totalQty ?? 0

  return (
    <header className="home-header">
      <Link className="home-brand" to="/home" aria-label={i18n.t("auto.060")}>
        ATELIER
      </Link>
      <nav className="home-navigation" aria-label={i18n.t("auto.061")}>
        <Link className="home-nav-button" to="/catalog">
          <Grid2X2 size={19} strokeWidth={1.8} aria-hidden="true" />
          {t('catalog')}
        </Link>
        <button
          type="button"
          className="home-nav-button"
          disabled
          title={i18n.t("auto.062")}
          aria-label={i18n.t("auto.063")}
        >
          <Heart size={19} strokeWidth={1.8} aria-hidden="true" />
          {t("wishlist")}
        </button>
        <Link
          to="/cart"
          className="home-nav-button"
          aria-label={isCartLoading ? i18n.t("auto.064") : `კალათა — ${cartQuantity} პროდუქტი`}
        >
          <ShoppingBag size={19} strokeWidth={1.8} aria-hidden="true" />
          {t("cart")}
          {!isCartLoading && cartQuantity > 0 && (
            <span className="home-cart-badge" aria-hidden="true">{cartQuantity}</span>
          )}
        </Link>
        {isSignedIn ? (
          <>
            <Link className="home-nav-button" to="/profile">
              <UserRound size={19} strokeWidth={1.8} aria-hidden="true" />
              {t("profile")}
            </Link>
            <button type="button" className="home-nav-button" onClick={logout}>
              <LogOut size={19} strokeWidth={1.8} aria-hidden="true" />
              {t("logout")}
            </button>
          </>
        ) : (
          <Link className="home-nav-button" to="/login">
            <LogIn size={19} strokeWidth={1.8} aria-hidden="true" />
            {t("login")}
          </Link>
        )}
        <div className="home-display-controls">
          <button type="button" className="home-nav-button" onClick={() => { const next = i18n.language === "en" ? "ka" : "en"; localStorage.setItem("atelier-language", next); void i18n.changeLanguage(next) }}>{i18n.language === "en" ? "EN / KA" : "KA / EN"}</button>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}

export default function HomePage() {
  useAtelierTranslation()
  const { i18n } = useTranslation()
  return (
    <main className="home-page">
      <div className="home-container">
        <Header />
      </div>

      <section className="home-hero" aria-label={i18n.t("auto.065")}>
        <img
          src={`${imageBase}hero.webp`}
          srcSet={`${imageBase}hero-960.webp 960w, ${imageBase}hero-1280.webp 1280w, ${imageBase}hero.webp 1916w`}
          sizes="100vw"
          alt={i18n.t("auto.066")}
          width={1916}
          height={821}
          fetchPriority="high"
        />
      </section>

      <div className="home-container home-sections">
        <section className="home-collection" aria-label={i18n.t("auto.067")}>
          <div className="home-cards home-cards--brands">
            {brands.map((brand) => (
              <Link
                key={brand.name}
                className="home-brand-card"
                to={`/catalog?brand=${encodeURIComponent(brand.name)}&page=1`}
                aria-label={`${brand.name} — ბრენდის პროდუქტები`}
              >
                <img
                  src={`${imageBase}${brand.image}`}
                  alt=""
                  loading="lazy"
                />
              </Link>
            ))}
          </div>
        </section>

        <section className="home-collection" aria-label={i18n.t("auto.068")}>
          <div className="home-cards home-cards--categories">
            {furnitureCategories.map((category) => (
              <Link
                key={category.name}
                className="home-category-card"
                to={categoryCatalogUrl(category.query)}
                aria-label={`${i18n.language === 'en' ? category.en : category.name} — ${i18n.language === 'en' ? 'View products' : 'პროდუქტების ნახვა'}`}
              >
                <img
                  src={`${imageBase}icons/${category.icon}`}
                  className="home-category-icon"
                  alt=""
                  loading="lazy"
                />
                <span className="home-category-name">{i18n.language === "en" ? category.en : category.name}</span>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}
