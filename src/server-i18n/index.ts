import i18next from 'i18next'
import en from './en'
import zh from './zh'

i18next.init({
  resources: {
    en: {
      translation: en,
    },
    zh: {
      translation: zh,
    },
  },
})
