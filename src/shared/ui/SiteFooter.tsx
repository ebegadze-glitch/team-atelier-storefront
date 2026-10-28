import { Link } from 'react-router-dom'
import { Music2 } from 'lucide-react'
import { categoryCatalogUrl, furnitureCategories } from '../data/furnitureCategories'
import './SiteFooter.css'

/** Three horizontal rows: brand and six equally spaced category links, social icons, office/copyright. */
export default function SiteFooter() {
  return (
    <footer className="atelier-site-footer" aria-label="ATELIER — ფუტერი">
      <div className="atelier-site-footer__inner">
        <div className="atelier-site-footer__top-scroll" tabIndex={0} aria-label="კატეგორიების ჰორიზონტალური ნავიგაცია">
          <div className="atelier-site-footer__top">
          <Link to="/home" className="atelier-site-footer__brand" aria-label="ATELIER — მთავარი">ATELIER</Link>

          <nav className="atelier-site-footer__categories" aria-label="ავეჯის კატეგორიები">
            {furnitureCategories.map(({ name, query }) => (
              <Link key={name} to={categoryCatalogUrl(query)}>{name}</Link>
            ))}
          </nav>

          </div>
        </div>

        <div className="atelier-site-footer__socials" aria-label="სოციალური ქსელები">
            <a
              href="https://www.facebook.com/profile.php?id=61595624776071"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ATELIER — Facebook (მაგალითი)"
              title="Facebook"
            ><svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.5 21v-8h2.7l.4-3.2h-3.1V8c0-.9.3-1.5 1.6-1.5H18V3.6a23 23 0 0 0-2.6-.1c-2.6 0-4.4 1.6-4.4 4.5v1.8H8V13h3v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
            <span title="Instagram — მალე" aria-label="Instagram — მალე"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></span>
            <span title="TikTok — მალე" aria-label="TikTok — მალე"><Music2 size={19} strokeWidth={1.8} aria-hidden="true" /></span>
            <span className="atelier-site-footer__pinterest" title="Pinterest — მალე" aria-label="Pinterest — მალე" role="img">P</span>
          </div>

        <div className="atelier-site-footer__bottom">
          <span className="atelier-site-footer__office">ოფისი: ბათუმი, ზურაბ გორგილაძის ქ. 88, ბათუმი მოლი</span>
          <small className="atelier-site-footer__copyright">© 2026 ATELIER. ყველა უფლება დაცულია.</small>
        </div>
      </div>
    </footer>
  )
}
