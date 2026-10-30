import i18n from '../i18n/index'
import LocalizedText from '../i18n/LocalizedText'
import { useTranslation as useAtelierTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Music2 } from 'lucide-react'
import { categoryCatalogUrl, furnitureCategories } from '../data/furnitureCategories'
import './SiteFooter.css'

/** Three horizontal rows: brand and six equally spaced category links, social icons, office/copyright. */
export default function SiteFooter() {
  useAtelierTranslation()
  return (
    <footer className="atelier-site-footer" aria-label={i18n.t("auto.231")}>
      <div className="atelier-site-footer__inner">
        <div className="atelier-site-footer__top-scroll" tabIndex={0} aria-label={i18n.t("auto.232")}>
          <div className="atelier-site-footer__top">
          <Link to="/home" className="atelier-site-footer__brand" aria-label={i18n.t("auto.233")}>ATELIER</Link>

          <nav className="atelier-site-footer__categories" aria-label={i18n.t("auto.234")}>
            {furnitureCategories.map(({ name, en, query }) => (
              <Link key={name} to={categoryCatalogUrl(query)}>{i18n.language === 'en' ? en : name}</Link>
            ))}
          </nav>

          </div>
        </div>

        <div className="atelier-site-footer__socials" aria-label={i18n.t("auto.235")}>
            <a
              href="https://www.facebook.com/profile.php?id=61595624776071"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={i18n.t("auto.236")}
              title="Facebook"
            ><svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.5 21v-8h2.7l.4-3.2h-3.1V8c0-.9.3-1.5 1.6-1.5H18V3.6a23 23 0 0 0-2.6-.1c-2.6 0-4.4 1.6-4.4 4.5v1.8H8V13h3v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></a>
            <span title={i18n.t("auto.237")} aria-label={i18n.t("auto.237")}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></span>
            <span title={i18n.t("auto.238")} aria-label={i18n.t("auto.238")}><Music2 size={19} strokeWidth={1.8} aria-hidden="true" /></span>
            <span className="atelier-site-footer__pinterest" title={i18n.t("auto.239")} aria-label={i18n.t("auto.239")} role="img">P</span>
          </div>

        <div className="atelier-site-footer__bottom">
          <span className="atelier-site-footer__office"><LocalizedText k="auto.240" /></span>
          <small className="atelier-site-footer__copyright"><LocalizedText k="auto.241" /></small>
        </div>
      </div>
    </footer>
  )
}
