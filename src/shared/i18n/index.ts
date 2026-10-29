import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const savedLanguage = localStorage.getItem('atelier-language')
const language = savedLanguage === 'en' ? 'en' : 'ka'

void i18n.use(initReactI18next).init({
  resources: {
    ka: {
      translation: {
        home: 'მთავარი',
        catalog: 'კატალოგი',
        cart: 'კალათა',
        profile: 'პროფილი',
        login: 'შესვლა',
        register: 'რეგისტრაცია',
        logout: 'გასვლა',
        checkout: 'შეკვეთის გაფორმება',
        language: 'ენა',
      },
    },
    en: {
      translation: {
        home: 'Home',
        catalog: 'Catalog',
        cart: 'Cart',
        profile: 'Profile',
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        checkout: 'Checkout',
        language: 'Language',
      },
    },
  },
  lng: language,
  fallbackLng: 'ka',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
