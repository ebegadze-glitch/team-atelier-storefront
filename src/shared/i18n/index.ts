import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ka from './locales/ka.json'
import en from './locales/en.json'

const savedLanguage = localStorage.getItem('atelier-language')
const language = savedLanguage === 'en' ? 'en' : 'ka'

void i18n.use(initReactI18next).init({
  resources: { ka: { translation: ka }, en: { translation: en } },
  lng: language,
  fallbackLng: 'ka',
  keySeparator: false,
  interpolation: { escapeValue: false },
})

export default i18n
