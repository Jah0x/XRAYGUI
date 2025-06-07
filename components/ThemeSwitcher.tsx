import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '~/client/theme';

/**
 * Компонент переключения темы (тёмная/светлая).
 */
export default function ThemeSwitcher() {
  const { theme, toggle } = useTheme();
  return (
    <button onClick={toggle} aria-label="Toggle theme" className="p-2">
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
