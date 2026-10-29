import { Link } from 'react-router-dom'
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
  const { status, logout } = useAuth()
  const { cart, isLoading: isCartLoading } = useCart()
  const isSignedIn = status === 'authenticated'
  const cartQuantity = cart?.totalQty ?? 0

  return (
    <header className="home-header">
      <Link className="home-brand" to="/home" aria-label="ATELIER — მთავარი გვერდი">
        ATELIER
      </Link>
      <nav className="home-navigation" aria-label="მთავარი მენიუ">
        <Link className="home-nav-button" to="/catalog">
          <Grid2X2 size={19} strokeWidth={1.8} aria-hidden="true" />
          კატალოგი
        </Link>
        <button
          type="button"
          className="home-nav-button"
          disabled
          title="სურვილების სია მოგვიანებით დაემატება"
          aria-label="სურვილების სია — მოგვიანებით"
        >
          <Heart size={19} strokeWidth={1.8} aria-hidden="true" />
          სურვილები
        </button>
        <Link
          to="/cart"
          className="home-nav-button"
          aria-label={isCartLoading ? 'კალათა იტვირთება' : `კალათა — ${cartQuantity} პროდუქტი`}
        >
          <ShoppingBag size={19} strokeWidth={1.8} aria-hidden="true" />
          კალათა
          {!isCartLoading && cartQuantity > 0 && (
            <span className="home-cart-badge" aria-hidden="true">{cartQuantity}</span>
          )}
        </Link>
        {isSignedIn ? (
          <>
            <Link className="home-nav-button" to="/profile">
              <UserRound size={19} strokeWidth={1.8} aria-hidden="true" />
              პროფილი
            </Link>
            <button type="button" className="home-nav-button" onClick={logout}>
              <LogOut size={19} strokeWidth={1.8} aria-hidden="true" />
              გასვლა
            </button>
          </>
        ) : (
          <Link className="home-nav-button" to="/login">
            <LogIn size={19} strokeWidth={1.8} aria-hidden="true" />
            შესვლა
          </Link>
        )}
      </nav>
    </header>
  )
}

export default function HomePage() {
  return (
    <main className="home-page">
      <div className="home-container">
        <Header />
      </div>

      <section className="home-hero" aria-label="ATELIER-ის ინტერიერის კოლექცია">
        <img
          src={`${imageBase}hero.webp`}
          alt="მუქი, თანამედროვე მისაღები ოთახი ბუხრით, დივნითა და მრგვალი მაგიდით"
          width={1916}
          height={821}
          fetchPriority="high"
        />
      </section>

      <div className="home-container home-sections">
        <section className="home-collection" aria-label="ბრენდები">
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

        <section className="home-collection" aria-label="კატეგორიები">
          <div className="home-cards home-cards--categories">
            {furnitureCategories.map((category) => (
              <Link
                key={category.name}
                className="home-category-card"
                to={categoryCatalogUrl(category.query)}
                aria-label={`${category.name} — პროდუქტების ნახვა`}
              >
                <img
                  src={`${imageBase}icons/${category.icon}`}
                  className="home-category-icon"
                  alt=""
                  loading="lazy"
                />
                <span className="home-category-name">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}
