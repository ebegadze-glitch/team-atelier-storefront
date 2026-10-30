import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from './ThemeContext'

export default function ThemeToggle({ floating = false }: { floating?: boolean }) {
  const { theme, toggleTheme } = useTheme()
  const { i18n } = useTranslation()
  const isKa = i18n.language.toLowerCase().startsWith('ka')
  const dark = theme === 'dark'
  const label = dark
    ? (isKa ? 'ღია რეჟიმზე გადასვლა' : 'Switch to light mode')
    : (isKa ? 'მუქ რეჟიმზე გადასვლა' : 'Switch to dark mode')

  return <button type="button" className={`atelier-theme-toggle${floating ? ' atelier-theme-toggle--floating' : ''}`}
    onClick={toggleTheme} aria-label={label} title={label} aria-pressed={dark}>
    {dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    <span>{dark ? (isKa ? 'ღია' : 'Light') : (isKa ? 'მუქი' : 'Dark')}</span>
  </button>
}
