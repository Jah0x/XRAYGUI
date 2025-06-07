import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

/**
 * Инициализация i18next с ленивой загрузкой переводов.
 */
export function setupI18n() {
  i18n.use(initReactI18next).init({
    lng: localStorage.getItem('lang') || 'en',
    fallbackLng: 'en',
    resources: {},
  });
}

export async function loadLocale(locale: string) {
  const messages = await import(`./locales/${locale}/translation.json`);
  i18n.addResourceBundle(locale, 'translation', messages.default, true, true);
  i18n.changeLanguage(locale);
  localStorage.setItem('lang', locale);
}
