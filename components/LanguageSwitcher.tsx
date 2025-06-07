import React from 'react';
import { loadLocale } from '~/i18n';

/**
 * Компонент переключения языка интерфейса.
 */
export default function LanguageSwitcher() {
  const change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    loadLocale(e.target.value);
  };
  return (
    <select onChange={change} defaultValue={localStorage.getItem('lang') || 'en'}>
      <option value="en">EN</option>
      <option value="ru">RU</option>
    </select>
  );
}
