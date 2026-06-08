import { useTheme } from '../hooks/useTheme';
import type { Theme } from '../hooks/useTheme';

const THEME_ICONS: Record<Theme, string> = { light: '☀️', dark: '🌙', auto: '🖥️' };
const THEME_NEXT_LABELS: Record<Theme, string> = {
  light: 'dark',
  dark: 'auto',
  auto: 'light',
};

export { type Theme };

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className="p-2 rounded-lg transition-all duration-300 hover:scale-110 focus:outline-none
                 focus-visible:ring-2 focus-visible:ring-white/60"
      aria-label={`Switch to ${THEME_NEXT_LABELS[theme]} mode`}
      title={`Switch to ${THEME_NEXT_LABELS[theme]} mode`}
    >
      <span
        className="block text-xl transition-transform duration-500 ease-out"
        style={{ transform: theme === 'dark' ? 'rotate(360deg)' : 'rotate(0deg)' }}
      >
        {THEME_ICONS[theme]}
      </span>
    </button>
  );
}
